import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {markNotebookMatches, renderNotebookPreview} from './notebook-preview';

const MAX_NOTEBOOK_BYTES = 25_000_000;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;

@Component({
  selector: 'f-notebook-viewer',
  templateUrl: './notebook-viewer.component.html',
  styleUrls: ['./notebook-viewer.component.scss'],
  host: {'class': 'block size-full min-h-0'},
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NotebookViewerComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @Input() notebookBlob?: Blob;
  @Input() notebookText = '';
  @ViewChild('notebookFrame', {static: true}) private frame: ElementRef<HTMLIFrameElement>;

  public isLoading = false;
  public errorMessage: string | null = null;
  public zoomValue = 1;
  public searchQuery = '';
  public viewMode: 'rendered' | 'raw' = 'rendered';
  public readonly rawEditorOptions = {
    theme: 'vs',
    language: 'json',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    renderMinimap: false,
    scrollbar: {alwaysConsumeMouseWheel: false},
    minimap: {enabled: false},
    readOnly: true,
    domReadOnly: true,
  };
  private isReady = false;
  private loadToken = 0;
  private pendingFrameLoad = false;
  private renderedHtml = '';
  private matchCount = 0;
  private matchIndex = 0;
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.isLoading = !!this.notebookBlob;
    const storedZoom = Number.parseFloat(localStorage.getItem('notebookViewerZoom') ?? '');
    if (Number.isFinite(storedZoom)) {
      this.zoomValue = Math.min(Math.max(storedZoom, ZOOM_MIN), ZOOM_MAX);
    }
  }

  public ngAfterViewInit(): void {
    this.isReady = true;
    void this.loadNotebook();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!this.isReady) {
      return;
    }
    if (changes['notebookBlob']) {
      this.viewMode = 'rendered';
      this.searchQuery = '';
      void this.loadNotebook();
    }
  }

  public ngOnDestroy(): void {
    this.loadToken++;
    clearTimeout(this.searchTimer);
    this.pendingFrameLoad = false;
    this.frame.nativeElement.srcdoc = '';
  }

  public onFrameLoad(): void {
    if (!this.pendingFrameLoad) {
      return;
    }
    this.pendingFrameLoad = false;
    this.isLoading = false;
    this.changeDetectorRef.detectChanges();
    this.scrollToMatch();
  }

  public findNextMatch(): void {
    if (this.matchCount === 0) {
      return;
    }
    this.matchIndex = (this.matchIndex + 1) % this.matchCount;
    this.scrollToMatch();
  }

  public zoomIn(): void {
    this.setZoom(this.zoomValue + 0.1);
  }

  public zoomOut(): void {
    this.setZoom(this.zoomValue - 0.1);
  }

  private setZoom(value: number): void {
    this.zoomValue = Math.min(Math.max(Math.round(value * 10) / 10, ZOOM_MIN), ZOOM_MAX);
    localStorage.setItem('notebookViewerZoom', this.zoomValue.toString());
  }

  private scrollToMatch(): void {
    if (this.matchCount > 0) {
      this.frame.nativeElement.contentWindow?.location.replace(
        `about:srcdoc#notebook-search-${this.matchIndex}`,
      );
    }
  }

  public scheduleSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.updateSearch(), 150);
  }

  private updateSearch(): void {
    if (!this.renderedHtml) {
      return;
    }
    const result = markNotebookMatches(this.renderedHtml, this.searchQuery);
    this.matchCount = result.count;
    this.matchIndex = 0;
    this.pendingFrameLoad = true;
    this.frame.nativeElement.srcdoc = result.html;
  }

  private async loadNotebook(): Promise<void> {
    const token = ++this.loadToken;
    const blob = this.notebookBlob;
    clearTimeout(this.searchTimer);
    this.renderedHtml = '';
    this.matchCount = 0;
    this.pendingFrameLoad = false;
    this.errorMessage = null;
    this.isLoading = !!blob;
    if (!blob) {
      this.frame.nativeElement.srcdoc = '';
      return;
    }
    if (blob.size > MAX_NOTEBOOK_BYTES) {
      this.frame.nativeElement.srcdoc = '';
      this.errorMessage = 'This notebook is too large to preview.';
      this.isLoading = false;
      queueMicrotask(() => {
        if (token === this.loadToken) {
          this.changeDetectorRef.detectChanges();
        }
      });
      return;
    }

    try {
      const notebook: unknown = JSON.parse(await blob.text());
      const html = await renderNotebookPreview(notebook);
      if (token === this.loadToken) {
        this.renderedHtml = html;
        this.updateSearch();
      }
    } catch {
      if (token === this.loadToken) {
        this.frame.nativeElement.srcdoc = '';
        this.errorMessage = 'Unable to preview this notebook.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    }
  }
}
