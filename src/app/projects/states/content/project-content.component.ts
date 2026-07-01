import JSZip from 'jszip';
import {HttpClient} from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {Subscription, firstValueFrom} from 'rxjs';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {GlobalStateService, ViewType} from '../index/global-state.service';

const ignoredArchivePath = /(^|\/)(?:__MACOSX|\.DS_Store|._[^/]+)(?:\/|$)/;
const externalUrl = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export interface ProjectContentDialogData {
  contentRoute: string;
  unit: Unit;
}

@Component({
  selector: 'f-project-content',
  templateUrl: './project-content.component.html',
  styleUrl: './project-content.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('contentIframe') contentIframe?: ElementRef<HTMLIFrameElement>;

  @Input() public contentRoute = '/';

  public readonly contentSrcDirectory = 'src';

  public isLoadingArchive = false;
  public archiveError?: string;
  public archiveFileCount = 0;
  public srcFileCount = 0;

  public get contentShellClass(): string {
    return this.dialogData
      ? 'flex h-full min-h-0 flex-col bg-[#f7f8fa]'
      : 'flex min-h-[calc(100vh-64px)] flex-col bg-[#f7f8fa]';
  }

  private archiveBlobUrl?: string;
  private assetUrls?: Map<string, string>;
  private contentArchive?: JSZip;
  private contentBlobUrls: string[] = [];
  private currentUnitId?: number;
  private htmlBlobUrls: Map<string, string> = new Map();
  private iframeClickCleanup?: () => void;
  private iframeReady = false;
  private iframeUrl?: string;
  private loadSequence = 0;
  private pendingIframeUrl?: string;
  private routeSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private globalState: GlobalStateService,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData?: ProjectContentDialogData,
  ) {}

  public ngOnInit(): void {
    if (this.dialogData) {
      this.setContentRouteFromPath(this.dialogData.contentRoute);
      this.setHeaderContext(this.dialogData.unit);
      void this.fetchContentArchive(this.dialogData.unit.id);
      return;
    }

    this.setContentRoute(this.route.snapshot.url);
    this.routeSubscription = this.route.url.subscribe((segments) => {
      const routeChanged = this.setContentRoute(segments);

      if (routeChanged && this.contentArchive) {
        void this.loadRouteFromArchive(this.contentArchive);
      }
    });

    const unit = this.route.parent?.snapshot.data.unit as Unit | undefined;

    if (unit) {
      this.setHeaderContext(unit);
      void this.fetchContentArchive(unit.id);
    }
  }

  public ngAfterViewInit(): void {
    this.iframeReady = true;
    this.applyPendingIframeUrl();
  }

  public ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.iframeClickCleanup?.();

    if (this.archiveBlobUrl) {
      URL.revokeObjectURL(this.archiveBlobUrl);
    }

    this.clearContentCache();
  }

  private setHeaderContext(unit: Unit): void {
    const studentProject = this.globalState.currentUserProjects.currentValues.find(
      (project: Project) => project.unit?.id === unit.id,
    );

    if (unit.myRole === 'Student' && studentProject) {
      this.globalState.setView(ViewType.PROJECT, studentProject);
      return;
    }

    this.globalState.setView(ViewType.UNIT, unit);
  }

  public onIframeLoad(): void {
    this.iframeClickCleanup?.();
    this.iframeClickCleanup = undefined;

    const doc = this.contentIframe?.nativeElement.contentDocument;

    if (!doc) {
      return;
    }

    const clickHandler = (event: MouseEvent) => {
      const target = event.target as {closest?: (selector: string) => HTMLAnchorElement | null};
      const link = target?.closest?.('a[href]') ?? null;

      if (!link || link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      const href = link.getAttribute('href');
      const archiveRoute = this.archiveRouteFromHref(href);

      if (!archiveRoute || !this.currentUnitId) {
        return;
      }

      event.preventDefault();

      if (this.dialogData) {
        this.setContentRouteFromPath(archiveRoute.path);

        if (this.contentArchive) {
          void this.loadRouteFromArchive(this.contentArchive, archiveRoute.fragment);
        }

        return;
      }

      const commands = ['/units', this.currentUnitId, 'content'];
      const segments = archiveRoute.path
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .filter(Boolean);

      void this.router.navigate([...commands, ...segments], {fragment: archiveRoute.fragment});
    };

    doc.addEventListener('click', clickHandler, true);
    this.iframeClickCleanup = () => doc.removeEventListener('click', clickHandler, true);
  }

  private loadIframeUrl(url: string, fragment?: string): void {
    if (fragment) {
      url = `${url}#${fragment}`;
    }

    if (this.iframeUrl === url) {
      return;
    }

    this.pendingIframeUrl = url;
    this.applyPendingIframeUrl();
  }

  private applyPendingIframeUrl(): void {
    if (!this.iframeReady || !this.pendingIframeUrl || !this.contentIframe) {
      return;
    }

    const iframe = this.contentIframe.nativeElement;
    const url = this.pendingIframeUrl;

    this.pendingIframeUrl = undefined;
    this.iframeUrl = url;

    if (iframe.contentWindow) {
      iframe.contentWindow.location.replace(url);
      return;
    }

    iframe.src = url;
  }

  private async fetchContentArchive(unitId: number): Promise<void> {
    this.isLoadingArchive = true;
    this.archiveError = undefined;
    this.currentUnitId = unitId;

    try {
      const archive = await firstValueFrom(
        this.http.get(`${API_URL}/units/${unitId}/content`, {responseType: 'blob'}),
      );

      if (this.archiveBlobUrl) {
        URL.revokeObjectURL(this.archiveBlobUrl);
      }

      this.clearContentCache();
      this.archiveBlobUrl = URL.createObjectURL(archive);

      const zip = await JSZip.loadAsync(archive);
      this.contentArchive = zip;
      const files = Object.values(zip.files).filter(
        (file) => !file.dir && !ignoredArchivePath.test(file.name),
      );

      this.archiveFileCount = files.length;
      this.srcFileCount = files.filter((file) =>
        file.name.startsWith(`${this.contentSrcDirectory}/`),
      ).length;

      await this.loadRouteFromArchive(zip);
    } catch {
      this.archiveError = 'Could not load the unit content route from the archive.';
    } finally {
      this.isLoadingArchive = false;
    }
  }

  private async loadRouteFromArchive(zip: JSZip, fragment?: string): Promise<void> {
    this.archiveError = undefined;
    const loadId = ++this.loadSequence;
    const route = this.normalizedContentRoute();
    const cachedHtmlBlobUrl = this.htmlBlobUrls.get(route);

    if (cachedHtmlBlobUrl) {
      this.loadIframeUrl(cachedHtmlBlobUrl, fragment);
      return;
    }

    const htmlPath = this.findHtmlPath(zip);
    const htmlFile = zip.file(htmlPath);

    if (!htmlFile) {
      throw new Error(`No HTML file found for ${this.contentRoute}.`);
    }

    this.assetUrls ??= await this.createAssetBlobUrls(zip, htmlPath);
    const html = await htmlFile.async('text');
    const rewrittenHtml = this.rewriteHtmlUrls(html, htmlPath, this.assetUrls);
    const htmlBlobUrl = URL.createObjectURL(new Blob([rewrittenHtml], {type: 'text/html'}));

    this.contentBlobUrls.push(htmlBlobUrl);
    this.htmlBlobUrls.set(route, htmlBlobUrl);

    if (loadId !== this.loadSequence || route !== this.normalizedContentRoute()) {
      return;
    }

    this.loadIframeUrl(htmlBlobUrl, fragment);
  }

  private findHtmlPath(zip: JSZip): string {
    const route = this.normalizedContentRoute();
    const filePaths = Object.values(zip.files)
      .filter((file) => !file.dir && !ignoredArchivePath.test(file.name))
      .map((file) => file.name);

    const candidates = route ? [`${route}/index.html`, `${route}.html`, route] : ['index.html'];

    for (const candidate of candidates) {
      const match = filePaths.find((path) => path.endsWith(candidate));

      if (match) {
        return match;
      }
    }

    throw new Error(`Could not find route ${this.contentRoute} in archive.`);
  }

  private archiveRouteFromHref(href: string | null): {path: string; fragment?: string} | undefined {
    if (!href || href.startsWith('#') || !this.contentArchive) {
      return undefined;
    }

    let url: URL;

    try {
      url = new URL(href, `https://archive.local${this.contentRouteForBase()}`);
    } catch {
      return undefined;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return undefined;
    }

    if (url.hostname !== 'archive.local') {
      return undefined;
    }

    const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/g, '');

    if (!this.hasHtmlPath(this.contentArchive, path)) {
      return undefined;
    }

    return {path, fragment: url.hash ? url.hash.slice(1) : undefined};
  }

  private hasHtmlPath(zip: JSZip, routePath: string): boolean {
    const route = routePath.replace(/^\/+|\/+$/g, '');
    const candidates = route ? [`${route}/index.html`, `${route}.html`, route] : ['index.html'];

    return Object.values(zip.files)
      .filter((file) => !file.dir && !ignoredArchivePath.test(file.name))
      .some((file) => candidates.some((candidate) => file.name.endsWith(candidate)));
  }

  private setContentRoute(segments: UrlSegment[]): boolean {
    const nextRoute =
      `/${segments
        .slice(1)
        .map((segment) => segment.path)
        .join('/')}`.replace(/\/+$/g, '') || '/';
    const normalizedRoute = nextRoute === '' ? '/' : nextRoute;
    const routeChanged = this.contentRoute !== normalizedRoute;

    this.contentRoute = normalizedRoute;

    return routeChanged;
  }

  private setContentRouteFromPath(path: string): boolean {
    const nextRoute = `/${path.replace(/^\/+|\/+$/g, '')}`.replace(/\/+$/g, '') || '/';
    const normalizedRoute = nextRoute === '' ? '/' : nextRoute;
    const routeChanged = this.contentRoute !== normalizedRoute;

    this.contentRoute = normalizedRoute;

    return routeChanged;
  }

  private normalizedContentRoute(): string {
    return this.contentRoute.replace(/^\/+|\/+$/g, '');
  }

  private contentRouteForBase(): string {
    return this.contentRoute.endsWith('/') ? this.contentRoute : `${this.contentRoute}/`;
  }

  private async createAssetBlobUrls(zip: JSZip, htmlPath: string): Promise<Map<string, string>> {
    const urls: Map<string, string> = new Map();
    const htmlRoot = this.archiveRootFor(htmlPath);
    const assetFiles = Object.values(zip.files).filter(
      (file) => !file.dir && !ignoredArchivePath.test(file.name) && !file.name.endsWith('.html'),
    );
    const cssFiles = assetFiles.filter((file) => file.name.endsWith('.css'));
    const otherFiles = assetFiles.filter((file) => !file.name.endsWith('.css'));

    await Promise.all(
      otherFiles.map(async (file) => {
        const blob = await file.async('blob');
        this.addArchiveBlobUrl(urls, file.name, blob, htmlRoot);
      }),
    );

    await Promise.all(
      cssFiles.map(async (file) => {
        const css = await this.rewriteCssFile(zip, file.name, htmlRoot, urls);
        const blob = new Blob([css], {type: this.mimeTypeFor(file.name)});
        this.addArchiveBlobUrl(urls, file.name, blob, htmlRoot);
      }),
    );

    return urls;
  }

  private addArchiveBlobUrl(
    urls: Map<string, string>,
    filePath: string,
    blob: Blob,
    htmlRoot: string,
  ): void {
    const blobUrl = URL.createObjectURL(new Blob([blob], {type: this.mimeTypeFor(filePath)}));

    this.contentBlobUrls.push(blobUrl);
    urls.set(filePath, blobUrl);
    urls.set(`/${filePath}`, blobUrl);

    if (htmlRoot && filePath.startsWith(`${htmlRoot}/`)) {
      urls.set(`/${filePath.slice(htmlRoot.length + 1)}`, blobUrl);
    }
  }

  private async rewriteCssFile(
    zip: JSZip,
    cssPath: string,
    htmlRoot: string,
    urls: Map<string, string>,
  ): Promise<string> {
    const css = await zip.file(cssPath)?.async('text');

    if (!css) {
      return '';
    }

    return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, url) => {
      if (externalUrl.test(url)) {
        return match;
      }

      const resolvedPath = this.resolveArchivePath(url, cssPath, htmlRoot);
      const blobUrl = urls.get(resolvedPath) ?? urls.get(`/${resolvedPath}`);

      if (!blobUrl) {
        return match;
      }

      return `url(${quote}${blobUrl}${quote})`;
    });
  }

  private rewriteHtmlUrls(html: string, htmlPath: string, urls: Map<string, string>): string {
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

    return rewritten;
  }

  private blobUrlForUrl(
    url: string,
    currentPath: string,
    urls: Map<string, string>,
  ): string | undefined {
    if (externalUrl.test(url)) {
      return undefined;
    }

    const resolvedPath = this.resolveArchivePath(
      url,
      currentPath,
      this.archiveRootFor(currentPath),
    );

    return urls.get(resolvedPath) ?? urls.get(`/${resolvedPath}`);
  }

  private resolveArchivePath(url: string, currentPath: string, archiveRoot: string): string {
    const [pathOnly] = url.split(/[?#]/);

    if (pathOnly.startsWith('/')) {
      return archiveRoot ? `${archiveRoot}${pathOnly}` : pathOnly.slice(1);
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

  private archiveRootFor(path: string): string {
    return path.includes('/') ? path.slice(0, path.indexOf('/')) : '';
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

  private revokeContentBlobUrls(): void {
    this.contentBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    this.contentBlobUrls = [];
  }

  private clearContentCache(): void {
    this.revokeContentBlobUrls();
    this.assetUrls = undefined;
    this.htmlBlobUrls.clear();
  }
}
