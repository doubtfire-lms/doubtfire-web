import {renderAsync} from 'docx-preview';
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

const SEARCH_HIGHLIGHT = 'docx-search';
const CURRENT_SEARCH_HIGHLIGHT = 'docx-search-current';

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

  public isLoading = false;
  public errorMessage: string | null = null;
  public zoomValue = 1;
  public docxSearchString = '';
  public useReadingView = false;

  private renderToken = 0;
  private searchMatches: Range[] = [];
  private searchMatchIndex = -1;
  private currentSearchMatch: Range | null = null;

  public ngOnInit(): void {
    const storedZoom = Number.parseFloat(localStorage.getItem('docxViewerZoom') ?? '');
    if (Number.isFinite(storedZoom)) {
      this.zoomValue = Math.min(Math.max(storedZoom, this.ZOOM_MIN), this.ZOOM_MAX);
    }
    this.useReadingView = localStorage.getItem('useReadingDocxViewer') === 'true';
  }

  public ngAfterViewInit(): void {
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
    if (!term) {
      return;
    }

    const walker = document.createTreeWalker(
      this.documentContainer.nativeElement,
      NodeFilter.SHOW_TEXT,
    );
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
    if (this.documentContainer) {
      void this.renderDocument();
    }
  }

  public ngOnDestroy(): void {
    this.renderToken++;
    this.clearSearchHighlights();
    this.documentContainer?.nativeElement.replaceChildren();
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

  private async renderDocument(): Promise<void> {
    const token = ++this.renderToken;
    const documentBlob = this.documentBlob;
    this.clearSearchHighlights();
    this.searchMatches = [];
    this.searchMatchIndex = -1;
    this.documentContainer.nativeElement.replaceChildren();
    this.errorMessage = null;

    if (!documentBlob) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    try {
      const rendered = document.createElement('div');
      await renderAsync(documentBlob, rendered, undefined, {
        renderAltChunks: false,
        useBase64URL: true,
        ignoreWidth: this.useReadingView,
        ignoreHeight: this.useReadingView,
        breakPages: !this.useReadingView,
      });

      if (token === this.renderToken) {
        this.documentContainer.nativeElement.replaceChildren(...Array.from(rendered.childNodes));
        if (this.docxSearchString) {
          this.searchDocx(this.docxSearchString);
        }
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
