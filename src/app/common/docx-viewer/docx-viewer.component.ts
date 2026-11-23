import {renderAsync} from 'docx-preview';
import DOMPurify from 'dompurify';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {sanitizeDocxInlineStyles, sanitizeDocxStyles} from './docx-css-sanitizer';
import {docxWithLegacyHyperlinks} from './docx-legacy-hyperlinks';

const SEARCH_HIGHLIGHT = 'docx-search';
const CURRENT_SEARCH_HIGHLIGHT = 'docx-search-current';
const SEARCH_HIGHLIGHT_STYLES = `
  ::highlight(docx-search) { background-color: #ffe066; }
  ::highlight(docx-search-current) { background-color: #ffb74d; }
`;

@Component({
  selector: 'f-docx-viewer',
  templateUrl: './docx-viewer.component.html',
  styleUrls: ['./docx-viewer.component.scss'],
  host: {'class': 'block size-full min-h-0'},
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DocxViewerComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  private readonly ZOOM_MIN = 0.5;
  private readonly ZOOM_MAX = 2.5;

  @Input() documentBlob?: Blob;
  @Output() downloadRequested: EventEmitter<void> = new EventEmitter();
  @ViewChild('documentContainer', {static: true})
  private documentContainer: ElementRef<HTMLElement>;
  private documentRoot?: ShadowRoot;

  public isLoading = false;
  public errorMessage: string | null = null;
  public zoomValue = 1;
  public docxSearchString = '';
  public useReadingView = false;

  private renderToken = 0;
  private readonly legacyPreviewCache: WeakMap<Blob, Promise<Blob>> = new WeakMap();
  private searchMatches: Range[] = [];
  private searchMatchIndex = -1;
  private currentSearchMatch: Range | null = null;
  private readonly handleDocumentClick = (event: MouseEvent): void => {
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[data-docx-bookmark-id]')
        : null;
    if (!link || !this.documentRoot?.contains(link)) {
      return;
    }

    event.preventDefault();
    const targetId = link.dataset.docxBookmarkId;
    if (targetId) {
      this.documentRoot.getElementById(targetId)?.scrollIntoView({block: 'start'});
    }
  };

  public ngOnInit(): void {
    this.isLoading = !!this.documentBlob;
    const storedZoom = Number.parseFloat(localStorage.getItem('docxViewerZoom') ?? '');
    if (Number.isFinite(storedZoom)) {
      this.zoomValue = Math.min(Math.max(storedZoom, this.ZOOM_MIN), this.ZOOM_MAX);
    }
    this.useReadingView = localStorage.getItem('useReadingDocxViewer') === 'true';
  }

  public ngAfterViewInit(): void {
    this.documentRoot = this.documentContainer.nativeElement.attachShadow({mode: 'open'});
    this.documentRoot.addEventListener('click', this.handleDocumentClick);
    void this.renderDocument();
  }

  public zoomIn(): void {
    this.setZoom(this.zoomValue + 0.1);
  }

  public zoomOut(): void {
    this.setZoom(this.zoomValue - 0.1);
  }

  public downloadDocument(): void {
    this.downloadRequested.emit();
  }

  public toggleReadingView(): void {
    this.useReadingView = !this.useReadingView;
    localStorage.setItem('useReadingDocxViewer', this.useReadingView.toString());
    void this.renderDocument();
  }

  public searchDocx(query: string): void {
    this.clearSearchHighlights();
    this.searchMatches = [];
    this.searchMatchIndex = -1;

    const term = query.trim().toLocaleLowerCase();
    if (!term || !this.documentRoot) {
      return;
    }

    const walker = document.createTreeWalker(this.documentRoot, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('style, script')) {
        continue;
      }

      const content = node.textContent?.toLocaleLowerCase() ?? '';
      let offset = 0;
      while ((offset = content.indexOf(term, offset)) !== -1) {
        const match = document.createRange();
        match.setStart(node, offset);
        match.setEnd(node, offset + term.length);
        this.searchMatches.push(match);
        offset += term.length;
      }
    }

    const registry = this.highlightRegistry();
    if (registry && this.searchMatches.length > 0) {
      const highlight = registry.get(SEARCH_HIGHLIGHT) ?? new Highlight();
      for (const match of this.searchMatches) {
        highlight.add(match);
      }
      registry.set(SEARCH_HIGHLIGHT, highlight);
    }

    this.findNextDocxMatch();
  }

  public findNextDocxMatch(): void {
    if (this.searchMatches.length === 0) {
      return;
    }

    const registry = this.highlightRegistry();
    if (registry && this.currentSearchMatch) {
      registry.get(CURRENT_SEARCH_HIGHLIGHT)?.delete(this.currentSearchMatch);
    }

    this.searchMatchIndex = (this.searchMatchIndex + 1) % this.searchMatches.length;
    const match = this.searchMatches[this.searchMatchIndex];
    this.currentSearchMatch = match;
    if (registry) {
      const highlight = registry.get(CURRENT_SEARCH_HIGHLIGHT) ?? new Highlight();
      highlight.priority = 1;
      highlight.add(match);
      registry.set(CURRENT_SEARCH_HIGHLIGHT, highlight);
    }
    match.startContainer.parentElement?.scrollIntoView({block: 'center'});
  }

  public ngOnChanges(): void {
    if (this.documentRoot) {
      void this.renderDocument();
    }
  }

  public ngOnDestroy(): void {
    this.renderToken++;
    this.clearSearchHighlights();
    this.documentRoot?.removeEventListener('click', this.handleDocumentClick);
    this.documentRoot?.replaceChildren();
  }

  private highlightRegistry(): HighlightRegistry | null {
    return typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined'
      ? CSS.highlights
      : null;
  }

  private clearSearchHighlights(): void {
    const registry = this.highlightRegistry();
    if (!registry) {
      return;
    }

    const allMatches = registry.get(SEARCH_HIGHLIGHT);
    for (const match of this.searchMatches) {
      allMatches?.delete(match);
    }
    if (allMatches?.size === 0) {
      registry.delete(SEARCH_HIGHLIGHT);
    }

    const currentMatch = registry.get(CURRENT_SEARCH_HIGHLIGHT);
    if (this.currentSearchMatch) {
      currentMatch?.delete(this.currentSearchMatch);
    }
    if (currentMatch?.size === 0) {
      registry.delete(CURRENT_SEARCH_HIGHLIGHT);
    }
    this.currentSearchMatch = null;
  }

  private setZoom(value: number): void {
    this.zoomValue = Math.min(Math.max(Math.round(value * 10) / 10, this.ZOOM_MIN), this.ZOOM_MAX);
    localStorage.setItem('docxViewerZoom', this.zoomValue.toString());
  }

  private previewBlobFor(documentBlob: Blob): Promise<Blob> {
    let previewPromise = this.legacyPreviewCache.get(documentBlob);
    if (!previewPromise) {
      previewPromise = docxWithLegacyHyperlinks(documentBlob);
      this.legacyPreviewCache.set(documentBlob, previewPromise);
    }
    return previewPromise;
  }

  private findBookmark(href: string, bookmarks: Map<string, HTMLElement>): HTMLElement | undefined {
    const bookmarkName = href.includes('#') ? href.slice(href.lastIndexOf('#') + 1) : '';
    try {
      return bookmarks.get(decodeURIComponent(bookmarkName));
    } catch {
      return undefined;
    }
  }

  private sanitizeLink(
    link: HTMLAnchorElement,
    rendered: HTMLElement,
    bookmarks: Map<string, HTMLElement>,
    pageUrls: URL[],
  ): void {
    const href = link.getAttribute('href')?.trim() ?? '';
    let url: URL;
    try {
      url = new URL(href, document.baseURI);
    } catch {
      link.removeAttribute('href');
      return;
    }

    const bookmark = this.findBookmark(href, bookmarks);
    const isViewerPage = pageUrls.some(
      (page) =>
        url.origin === page.origin && url.pathname === page.pathname && url.search === page.search,
    );
    if (isViewerPage && bookmark && rendered.contains(bookmark)) {
      link.href = `#${encodeURIComponent(bookmark.id)}`;
      link.dataset.docxBookmarkId = bookmark.id;
      link.removeAttribute('target');
    } else if (url.protocol === 'http:' || url.protocol === 'https:') {
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else if (url.protocol !== 'mailto:' && url.protocol !== 'tel:') {
      link.removeAttribute('href');
    }
  }

  private attachRenderedDocument(root: ShadowRoot, rendered: HTMLElement): void {
    const bookmarks: Map<string, HTMLElement> = new Map(
      Array.from(rendered.querySelectorAll<HTMLElement>('span[id]')).map((element) => [
        element.id,
        element,
      ]),
    );
    const documentStyles = sanitizeDocxStyles(
      Array.from(rendered.children)
        .filter((element): element is HTMLStyleElement => element.tagName === 'STYLE')
        .map((style) => style.textContent ?? ''),
    );

    // The document is untrusted. Strip its style elements and sanitize
    // generated CSS separately before attaching anything to the page.
    DOMPurify.sanitize(rendered, {
      IN_PLACE: true,
      FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'script'],
      SANITIZE_NAMED_PROPS: true,
    });
    sanitizeDocxInlineStyles(rendered);
    const pageUrls = [new URL(document.baseURI), new URL(document.URL)];
    for (const link of rendered.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      this.sanitizeLink(link, rendered, bookmarks, pageUrls);
    }

    const highlightStyles = document.createElement('style');
    highlightStyles.textContent = SEARCH_HIGHLIGHT_STYLES;
    const safeStyles = documentStyles.map((css) => {
      const style = document.createElement('style');
      style.textContent = css;
      return style;
    });
    root.replaceChildren(...safeStyles, highlightStyles, ...Array.from(rendered.childNodes));
    if (this.docxSearchString) {
      this.searchDocx(this.docxSearchString);
    }
  }

  private async renderDocument(): Promise<void> {
    const root = this.documentRoot;
    if (!root) {
      return;
    }

    const token = ++this.renderToken;
    const documentBlob = this.documentBlob;
    this.clearSearchHighlights();
    this.searchMatches = [];
    this.searchMatchIndex = -1;
    root.replaceChildren();
    this.errorMessage = null;

    if (!documentBlob) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    try {
      const rendered = document.createElement('div');
      const previewBlob = await this.previewBlobFor(documentBlob);
      if (token !== this.renderToken) {
        return;
      }
      await renderAsync(previewBlob, rendered, undefined, {
        renderAltChunks: false,
        useBase64URL: true,
        ignoreWidth: this.useReadingView,
        ignoreHeight: this.useReadingView,
        breakPages: !this.useReadingView,
      });

      if (token === this.renderToken) {
        this.attachRenderedDocument(root, rendered);
      }
    } catch {
      if (token === this.renderToken) {
        this.errorMessage =
          'Unable to preview this Word document. Download the original to open it.';
      }
    } finally {
      if (token === this.renderToken) {
        this.isLoading = false;
      }
    }
  }
}
