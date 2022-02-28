import { HttpResponse } from '@angular/common/http';
import { Component, Input, Inject, OnDestroy } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { FileDownloaderService } from '../file-downloader/file-downloader';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnDestroy {
  private _pdfUrl: string;
  public pdfBlobUrl: string;

  constructor(
    @Inject(FileDownloaderService) private fileDownloader: FileDownloaderService,
    @Inject(alertService) private alerts: any
  ) { }

  ngOnDestroy(): void {
    if ( this.pdfBlobUrl ) {
      this.fileDownloader.releaseBlob(this.pdfBlobUrl);
    }
  }

  @Input() set pdfUrl(value: string) {
    if ( this._pdfUrl !== value ) {

      // Free the memory used by the old PDF blob
      if ( this.pdfBlobUrl ) {
        this.fileDownloader.releaseBlob(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }

      // Get the new blob
      this._pdfUrl = value;
      this.downloadBlob();
    }
  }

  get pdfUrl(): string {
    return this._pdfUrl;
  }

  private downloadBlob(): void {
    this.fileDownloader.downloadBlob(
      this._pdfUrl,
      (url: string, response: HttpResponse<Blob>) => {
        this.pdfBlobUrl = url;
      },
      (error: any) => {
        this.alerts.add('danger', `Error downloading PDF. ${error}`, 6000);
      }
    );
  }
}
