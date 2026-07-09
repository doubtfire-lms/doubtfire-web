import JSZip from 'jszip';

const ignoredArchivePath = /(^|\/)(?:__MACOSX|\.DS_Store|._[^/]+)(?:\/|$)/;
const externalUrl = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export interface UnitContentArchiveRoute {
  fragment?: string;
  path: string;
}

export interface UnitContentArchiveLoadResult {
  fragment?: string;
  iframeUrl: string;
}

export class UnitContentArchive {
  private assetUrls?: Map<string, string>;
  private readonly blobUrls: string[] = [];
  private readonly htmlBlobUrls: Map<string, string> = new Map();
  private loadSequence = 0;

  constructor(
    private readonly zip: JSZip,
    private readonly archiveRootDir: string,
  ) {}

  public async loadRoute(route: string, fragment?: string): Promise<UnitContentArchiveLoadResult> {
    const loadId = ++this.loadSequence;
    const normalizedRoute = this.normalizedArchivePath(route);
    const cachedHtmlBlobUrl = this.htmlBlobUrls.get(normalizedRoute);

    if (cachedHtmlBlobUrl) {
      return {iframeUrl: cachedHtmlBlobUrl, fragment};
    }

    const htmlPath = this.findHtmlPath(normalizedRoute);
    const htmlFile = this.zip.file(htmlPath);

    if (!htmlFile) {
      throw new Error(`No HTML file found for ${route}.`);
    }

    this.assetUrls ??= await this.createAssetBlobUrls();
    const html = await htmlFile.async('text');
    const rewrittenHtml = await this.rewriteHtmlUrls(html, htmlPath, this.assetUrls);
    const htmlBlobUrl = URL.createObjectURL(new Blob([rewrittenHtml], {type: 'text/html'}));

    this.blobUrls.push(htmlBlobUrl);
    this.htmlBlobUrls.set(normalizedRoute, htmlBlobUrl);

    if (loadId !== this.loadSequence) {
      throw new Error('Route load was superseded.');
    }

    return {iframeUrl: htmlBlobUrl, fragment};
  }

  public routeFromHref(
    href: string | null,
    currentRoute: string,
  ): UnitContentArchiveRoute | undefined {
    if (!href || href.startsWith('#')) {
      return undefined;
    }

    let url: URL;

    try {
      url = new URL(href, `https://archive.local${this.contentRouteForBase(currentRoute)}`);
    } catch {
      return undefined;
    }

    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      url.hostname !== 'archive.local'
    ) {
      return undefined;
    }

    const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/g, '');

    if (!this.hasHtmlPath(path)) {
      return undefined;
    }

    return {path, fragment: url.hash ? url.hash.slice(1) : undefined};
  }

  public dispose(): void {
    this.blobUrls.forEach((url) => URL.revokeObjectURL(url));
    this.blobUrls.length = 0;
    this.assetUrls = undefined;
    this.htmlBlobUrls.clear();
  }

  private findHtmlPath(route: string): string {
    const candidates = this.htmlPathCandidates(route);
    const filePaths = this.archiveFilePaths();

    for (const candidate of candidates) {
      const match = filePaths.find((path) => path === candidate);

      if (match) {
        return match;
      }
    }

    throw new Error(`Could not find route ${route} in archive.`);
  }

  private hasHtmlPath(routePath: string): boolean {
    const candidates = this.htmlPathCandidates(this.normalizedArchivePath(routePath));

    return this.archiveFilePaths().some((filePath) => candidates.includes(filePath));
  }

  private archiveFilePaths(): string[] {
    return Object.values(this.zip.files)
      .filter((file) => !file.dir && !ignoredArchivePath.test(file.name))
      .map((file) => file.name);
  }

  private htmlPathCandidates(route: string): string[] {
    const routeCandidates = route
      ? [`${route}/index.html`, `${route}.html`, route]
      : ['index.html'];

    return routeCandidates.map((candidate) => this.archivePathWithinRoot(candidate));
  }

  private archivePathWithinRoot(path: string): string {
    const normalizedPath = this.normalizedArchivePath(path);

    return this.archiveRootDir
      ? `${this.archiveRootDir}/${normalizedPath}`.replace(/\/+$/g, '')
      : normalizedPath;
  }

  private contentRouteForBase(route: string): string {
    return route.endsWith('/') ? route : `${route}/`;
  }

  private async createAssetBlobUrls(): Promise<Map<string, string>> {
    const urls: Map<string, string> = new Map();
    const assetFiles = Object.values(this.zip.files).filter(
      (file) => !file.dir && !ignoredArchivePath.test(file.name) && !file.name.endsWith('.html'),
    );
    const cssFiles = assetFiles.filter((file) => file.name.endsWith('.css'));
    const jsFiles = assetFiles.filter((file) => this.isJavaScriptPath(file.name));
    const jsFilesByPath = new Map(jsFiles.map((file) => [file.name, file]));
    const otherFiles = assetFiles.filter(
      (file) => !file.name.endsWith('.css') && !this.isJavaScriptPath(file.name),
    );

    await Promise.all(
      otherFiles.map(async (file) => {
        const blob = await file.async('blob');
        this.addArchiveBlobUrl(urls, file.name, blob);
      }),
    );

    await Promise.all(
      cssFiles.map(async (file) => {
        const css = await this.rewriteCssFile(file.name, urls);
        const blob = new Blob([css], {type: this.mimeTypeFor(file.name)});
        this.addArchiveBlobUrl(urls, file.name, blob);
      }),
    );

    const jsFilesBeingRewritten: Set<string> = new Set();
    const rewriteJavaScriptFile = async (file: JSZip.JSZipObject): Promise<string | undefined> => {
      const existingUrl = urls.get(file.name);

      if (existingUrl) {
        return existingUrl;
      }

      if (jsFilesBeingRewritten.has(file.name)) {
        return undefined;
      }

      jsFilesBeingRewritten.add(file.name);

      try {
        const js = await file.async('text');
        const rewrittenJs = await this.rewriteJavaScriptFile(
          js,
          file.name,
          urls,
          jsFilesByPath,
          rewriteJavaScriptFile,
        );
        const blob = new Blob([rewrittenJs], {type: this.mimeTypeFor(file.name)});

        return this.addArchiveBlobUrl(urls, file.name, blob);
      } finally {
        jsFilesBeingRewritten.delete(file.name);
      }
    };

    await Promise.all(jsFiles.map((file) => rewriteJavaScriptFile(file)));

    return urls;
  }

  private addArchiveBlobUrl(urls: Map<string, string>, filePath: string, blob: Blob): string {
    const blobUrl = URL.createObjectURL(new Blob([blob], {type: this.mimeTypeFor(filePath)}));

    this.blobUrls.push(blobUrl);
    this.setArchiveBlobUrl(urls, filePath, blobUrl);

    return blobUrl;
  }

  private setArchiveBlobUrl(urls: Map<string, string>, filePath: string, blobUrl: string): void {
    urls.set(filePath, blobUrl);
    urls.set(`/${filePath}`, blobUrl);

    if (this.archiveRootDir && filePath.startsWith(`${this.archiveRootDir}/`)) {
      urls.set(`/${filePath.slice(this.archiveRootDir.length + 1)}`, blobUrl);
    }
  }

  private async rewriteCssFile(cssPath: string, urls: Map<string, string>): Promise<string> {
    const css = await this.zip.file(cssPath)?.async('text');

    if (!css) {
      return '';
    }

    return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, url) => {
      if (externalUrl.test(url)) {
        return match;
      }

      const resolvedPath = this.resolveArchivePath(url, cssPath);
      const blobUrl = urls.get(resolvedPath) ?? urls.get(`/${resolvedPath}`);

      if (!blobUrl) {
        return match;
      }

      return `url(${quote}${blobUrl}${quote})`;
    });
  }

  private async rewriteHtmlUrls(
    html: string,
    htmlPath: string,
    urls: Map<string, string>,
  ): Promise<string> {
    let rewritten = html.replace(
      /\b(src|href|poster)=("|')([^"']+)\2/g,
      (match, attr, quote, url) => {
        const blobUrl = this.blobUrlForUrl(url, htmlPath, urls);

        return blobUrl ? `${attr}=${quote}${blobUrl}${quote}` : match;
      },
    );

    rewritten = rewritten.replace(/\bsrcset=("|')([^"']+)\1/g, (match, quote, srcset) => {
      const rewrittenSrcset = srcset
        .split(',')
        .map((entry) => {
          const [url, ...descriptor] = entry.trim().split(/\s+/);
          const blobUrl = this.blobUrlForUrl(url, htmlPath, urls);

          return [blobUrl ?? url, ...descriptor].join(' ');
        })
        .join(', ');

      return `srcset=${quote}${rewrittenSrcset}${quote}`;
    });

    const scriptReplacements: Array<{from: string; to: string}> = [];

    for (const match of rewritten.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const [scriptTag, attributes, scriptContent] = match;

      if (!this.shouldRewriteInlineScript(attributes, scriptContent)) {
        continue;
      }

      const rewrittenScript = await this.rewriteJavaScriptFile(
        scriptContent,
        htmlPath,
        urls,
        new Map(),
        async () => undefined,
      );

      scriptReplacements.push({
        from: scriptTag,
        to: `<script${attributes}>${rewrittenScript}</script>`,
      });
    }

    rewritten = scriptReplacements.reduce(
      (updatedHtml, replacement) => updatedHtml.replace(replacement.from, replacement.to),
      rewritten,
    );

    return rewritten;
  }

  private async rewriteJavaScriptFile(
    js: string,
    jsPath: string,
    urls: Map<string, string>,
    jsFilesByPath: Map<string, JSZip.JSZipObject>,
    rewriteJavaScriptFile: (file: JSZip.JSZipObject) => Promise<string | undefined>,
  ): Promise<string> {
    let rewritten = await this.replaceJavaScriptModuleSpecifiers(
      js,
      /\b((?:import|export)(?:\s*[^'"]*?\s*from\s*)?\s*)(["'])([^"']+)\2/g,
      jsPath,
      urls,
      jsFilesByPath,
      rewriteJavaScriptFile,
    );

    rewritten = await this.replaceJavaScriptModuleSpecifiers(
      rewritten,
      /\b(import\s*\(\s*)(["'])([^"']+)\2(\s*\))/g,
      jsPath,
      urls,
      jsFilesByPath,
      rewriteJavaScriptFile,
    );

    return rewritten;
  }

  private async replaceJavaScriptModuleSpecifiers(
    js: string,
    pattern: RegExp,
    jsPath: string,
    urls: Map<string, string>,
    jsFilesByPath: Map<string, JSZip.JSZipObject>,
    rewriteJavaScriptFile: (file: JSZip.JSZipObject) => Promise<string | undefined>,
  ): Promise<string> {
    const replacements: Array<{from: string; to: string}> = [];

    for (const match of js.matchAll(pattern)) {
      const specifier = match[3];
      const blobUrl = await this.blobUrlForJavaScriptSpecifier(
        specifier,
        jsPath,
        urls,
        jsFilesByPath,
        rewriteJavaScriptFile,
      );

      if (blobUrl) {
        replacements.push({from: match[0], to: this.replaceMatchedSpecifier(match, blobUrl)});
      }
    }

    return replacements.reduce(
      (rewritten, replacement) => rewritten.replace(replacement.from, replacement.to),
      js,
    );
  }

  private async blobUrlForJavaScriptSpecifier(
    specifier: string,
    jsPath: string,
    urls: Map<string, string>,
    jsFilesByPath: Map<string, JSZip.JSZipObject>,
    rewriteJavaScriptFile: (file: JSZip.JSZipObject) => Promise<string | undefined>,
  ): Promise<string | undefined> {
    if (externalUrl.test(specifier)) {
      return undefined;
    }

    const {path, suffix} = this.splitUrlSuffix(specifier);
    const resolvedPath = this.resolveArchivePath(path, jsPath);
    const jsFile = jsFilesByPath.get(resolvedPath);
    const blobUrl = jsFile
      ? await rewriteJavaScriptFile(jsFile)
      : (urls.get(resolvedPath) ?? urls.get(`/${resolvedPath}`));

    return blobUrl ? `${blobUrl}${suffix}` : undefined;
  }

  private replaceMatchedSpecifier(match: RegExpMatchArray, specifier: string): string {
    if (match.length === 5) {
      return `${match[1]}${match[2]}${specifier}${match[2]}${match[4]}`;
    }

    return `${match[1]}${match[2]}${specifier}${match[2]}`;
  }

  private shouldRewriteInlineScript(attributes: string, scriptContent: string): boolean {
    if (/\bsrc\s*=/i.test(attributes)) {
      return false;
    }

    return /\btype\s*=\s*["']module["']/i.test(attributes) || /\bimport\s*\(/.test(scriptContent);
  }

  private blobUrlForUrl(
    url: string,
    currentPath: string,
    urls: Map<string, string>,
  ): string | undefined {
    if (externalUrl.test(url)) {
      return undefined;
    }

    const resolvedPath = this.resolveArchivePath(url, currentPath);

    return urls.get(resolvedPath) ?? urls.get(`/${resolvedPath}`);
  }

  private resolveArchivePath(url: string, currentPath: string): string {
    const {path: pathOnly} = this.splitUrlSuffix(url);

    if (pathOnly.startsWith('/')) {
      return this.archiveRootDir ? `${this.archiveRootDir}${pathOnly}` : pathOnly.slice(1);
    }

    const currentDirectory = currentPath.slice(0, currentPath.lastIndexOf('/') + 1);
    const parts = `${currentDirectory}${pathOnly}`.split('/');
    const resolved: string[] = [];

    parts.forEach((part) => {
      if (!part || part === '.') {
        return;
      }

      if (part === '..') {
        resolved.pop();
        return;
      }

      resolved.push(part);
    });

    return resolved.join('/');
  }

  private normalizedArchivePath(path: string): string {
    return path.replace(/^\/+|\/+$/g, '');
  }

  private splitUrlSuffix(url: string): {path: string; suffix: string} {
    const suffixStart = url.search(/[?#]/);

    if (suffixStart === -1) {
      return {path: url, suffix: ''};
    }

    return {path: url.slice(0, suffixStart), suffix: url.slice(suffixStart)};
  }

  private isJavaScriptPath(path: string): boolean {
    return /\.(?:js|mjs)$/i.test(path);
  }

  private mimeTypeFor(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'css':
        return 'text/css';
      case 'js':
        return 'text/javascript';
      case 'svg':
        return 'image/svg+xml';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'woff2':
        return 'font/woff2';
      case 'ttf':
        return 'font/ttf';
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      default:
        return 'application/octet-stream';
    }
  }
}
