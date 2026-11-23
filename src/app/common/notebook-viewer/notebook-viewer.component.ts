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
  ViewChild,
} from '@angular/core';
import {renderNotebookPreview} from './notebook-preview';

const MAX_NOTEBOOK_BYTES = 25_000_000;

@Component({
  selector: 'f-notebook-viewer',
  templateUrl: './notebook-viewer.component.html',
  host: {'class': 'block size-full min-h-0'},
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NotebookViewerComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @Input() notebookBlob?: Blob;
  @ViewChild('notebookFrame', {static: true}) private frame: ElementRef<HTMLIFrameElement>;

  public isLoading = false;
  public errorMessage: string | null = null;
  private isReady = false;
  private loadToken = 0;
  private pendingFrameLoad = false;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.isLoading = !!this.notebookBlob;
  }

  public ngAfterViewInit(): void {
    this.isReady = true;
    void this.loadNotebook();
  }

  public ngOnChanges(): void {
    if (this.isReady) {
      void this.loadNotebook();
    }
  }

  public ngOnDestroy(): void {
    this.loadToken++;
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
  }

  private async loadNotebook(): Promise<void> {
    const token = ++this.loadToken;
    const blob = this.notebookBlob;
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
        this.pendingFrameLoad = true;
        this.frame.nativeElement.srcdoc = html;
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
