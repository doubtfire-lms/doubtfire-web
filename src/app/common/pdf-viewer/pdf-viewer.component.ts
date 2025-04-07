import {HttpResponse} from '@angular/common/http';
import {
  Component,
  Input,
  Inject,
  OnDestroy,
  SimpleChanges,
  OnChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {PdfViewerComponent} from 'ng2-pdf-viewer';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'f-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class fPdfViewerComponent implements OnDestroy, OnChanges, AfterViewInit {
  private _pdfUrl: string;
  public pdfBlobUrl: string;
  public useNativePdfViewer = false;

  @Input() pdfUrl: string;
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
      this.downloadBlob(value);
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

  public zoomIn() {
    if (this.zoomValue < 2.5) {
      this.zoomValue += 0.1;
    }
  }
  public zoomOut() {
    if (this.zoomValue > 0.5) {
      this.zoomValue -= 0.1;
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

  onLoaded() {
    this.loaded = true;
    window.dispatchEvent(new Event('resize'));
  }
}
