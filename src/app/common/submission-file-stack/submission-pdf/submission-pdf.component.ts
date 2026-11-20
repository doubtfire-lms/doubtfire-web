import {PdfViewerComponent} from 'ng2-pdf-viewer';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

/**
 * Shows every page of a PDF at the card's width, with no scrollbar of its own.
 *
 * pdf.js needs its pages box to be absolutely positioned, so the box cannot
 * grow with its pages. Instead this component sets its own height to the
 * height of all pages, so the box never needs to scroll and the page's main
 * scroll moves through the PDF.
 */
@Component({
  selector: 'f-submission-pdf',
  templateUrl: './submission-pdf.component.html',
  host: {'class': 'block bg-slate-100'},
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionPdfComponent implements AfterViewInit, OnDestroy {
  @Input() pdfUrl: string;

  // Only load the PDF once the card is close to the screen
  public isNearScreen = false;
  public isLoaded = false;
  public hasError = false;
  public pagesHeight: number | null = null;

  @ViewChild(PdfViewerComponent) private pdfComponent?: PdfViewerComponent;

  private visibilityObserver?: IntersectionObserver;
  private pagesObserver?: ResizeObserver;
  private widthObserver?: ResizeObserver;
  private lastWidth = 0;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  public ngAfterViewInit(): void {
    this.visibilityObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.visibilityObserver?.disconnect();
          this.zone.run(() => {
            this.isNearScreen = true;
            this.changeDetector.markForCheck();
          });
        }
      },
      {rootMargin: '800px 0px'},
    );
    this.visibilityObserver.observe(this.host.nativeElement);

    // pdf.js only rescales pages on window resize, so also rescale when the
    // panel itself changes width (for example when a side panel is dragged).
    this.widthObserver = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width !== this.lastWidth) {
        this.lastWidth = width;
        this.pdfComponent?.updateSize();
      }
    });
    this.widthObserver.observe(this.host.nativeElement);
  }

  public ngOnDestroy(): void {
    this.visibilityObserver?.disconnect();
    this.pagesObserver?.disconnect();
    this.widthObserver?.disconnect();
  }

  public onPagesInitialized(): void {
    const pages = this.host.nativeElement.querySelector<HTMLElement>('.pdfViewer');
    if (!pages) {
      return;
    }

    this.pagesObserver?.disconnect();
    // Follow the pages' height as pdf.js lays them out and rescales them
    this.pagesObserver = new ResizeObserver(() => this.updateHeight(pages));
    this.pagesObserver.observe(pages);
    this.updateHeight(pages);
  }

  public onLoaded(): void {
    this.isLoaded = true;
  }

  public onError(): void {
    this.hasError = true;
  }

  private updateHeight(pages: HTMLElement): void {
    const height = Math.ceil(pages.scrollHeight);
    if (height > 0 && height !== this.pagesHeight) {
      this.zone.run(() => {
        this.pagesHeight = height;
        this.changeDetector.markForCheck();
      });
    }
  }
}
