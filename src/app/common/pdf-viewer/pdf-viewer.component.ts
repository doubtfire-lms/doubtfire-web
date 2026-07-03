import {PDFDocumentProxy, PdfViewerComponent, PdfViewerModule} from 'ng2-pdf-viewer';
import {HttpResponse} from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {MatFormField, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';
import {SafePipe} from '../pipes/safe.pipe';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'f-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIconButton,
    MatIcon,
    FormsModule,
    MatFormField,
    MatPrefix,
    MatInput,
    MatSuffix,
    PdfViewerModule,
    MatProgressSpinner,
    SafePipe,
  ],
})
export class fPdfViewerComponent implements OnDestroy, OnChanges, AfterViewInit {
  private readonly ZOOM_MIN = 0.5;
  private readonly ZOOM_MAX = 2.5;

  private _pdfUrl: string;
  public pdfBlobUrl: string;
  public useNativePdfViewer = false;
  public pdfTotalPages?: number | undefined;
  public pdfHasRendered: boolean = false;

  @Input() pdfUrl: string;
  @Input() startPage: number = 1;

  public pageNumber: number = 1;

  @ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent;
  pdfSearchString: string;
  zoomValue = 1;
  loaded = false;

  constructor(
    @Inject(FileDownloaderService) private fileDownloader: FileDownloaderService,
    private alerts: AlertService,
  ) {}

  ngOnDestroy(): void {
    if (this.pdfBlobUrl) {
      this.fileDownloader.releaseBlob(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }

  ngAfterViewInit(): void {
    this.useNativePdfViewer = localStorage.getItem('useNativePdfViewer') === 'true';
    const storedZoomValue = parseFloat(localStorage.getItem('pdfViewerZoom')) || 1;
    // Clamp zoom value between ZOOM_MIN and ZOOM_MAX
    this.zoomValue = Math.min(Math.max(storedZoomValue, this.ZOOM_MIN), this.ZOOM_MAX);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pdfUrlChanges(changes.pdfUrl.currentValue);
  }

  pdfUrlChanges(value: string): void {
    if (this._pdfUrl !== value) {
      // Free the memory used by the old PDF blob
      if (this.pdfBlobUrl) {
        this.fileDownloader.releaseBlob(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }

      // Get the new blob
      this._pdfUrl = value;
      this.loaded = false;
      this.pdfHasRendered = false;
      if (value?.startsWith('blob:')) {
        this.pdfBlobUrl = value;
      } else {
        this.downloadBlob(value);
      }
    }
  }

  searchPdf(stringToSearch: string): void {
    this.pdfComponent.eventBus.dispatch('find', {
      query: stringToSearch,
      type: 'again',
      caseSensitive: false,
      findPrevious: undefined,
      highlightAll: true,
      phraseSearch: true,
    });
  }

  scrollToPage(pageNumber: number) {
    if (pageNumber <= this.pdfComponent.pdfViewer.pagesCount) {
      this.pdfComponent.pdfViewer.scrollPageIntoView({
        pageNumber,
      });
    }
  }

  public zoomIn() {
    if (this.zoomValue < this.ZOOM_MAX) {
      this.zoomValue += 0.1;
      localStorage.setItem('pdfViewerZoom', this.zoomValue.toString());
    }
  }
  public zoomOut() {
    if (this.zoomValue > this.ZOOM_MIN) {
      this.zoomValue -= 0.1;
      localStorage.setItem('pdfViewerZoom', this.zoomValue.toString());
    }
  }

  public downloadPdf() {
    this.fileDownloader.downloadBlobToFile(this.pdfBlobUrl, 'displayed-pdf.pdf');
  }

  public toggleNativePdfViewer() {
    this.useNativePdfViewer = !this.useNativePdfViewer;
    localStorage.setItem('useNativePdfViewer', this.useNativePdfViewer.toString());
  }

  private downloadBlob(downloadUrl: string): void {
    this.fileDownloader.downloadBlob(
      downloadUrl,
      (url: string, _response: HttpResponse<Blob>) => {
        this.pdfBlobUrl = url;
      },
      (error: unknown) => {
        this.alerts.error(`Error downloading PDF. ${error}`, 6000);
      },
    );
  }

  onLoaded(event: PDFDocumentProxy) {
    this.loaded = true;
    window.dispatchEvent(new Event('resize'));
    this.pdfTotalPages = event.numPages;
  }

  onTextLayerRendered() {
    if (this.pdfHasRendered) {
      return;
    }
    this.pdfHasRendered = true;
    setTimeout(() => {
      if (
        this.startPage &&
        this.startPage > 1 &&
        this.pdfTotalPages &&
        this.startPage <= this.pdfTotalPages
      ) {
        this.pageNumber = Number(this.startPage);
      }
    });
  }
}
