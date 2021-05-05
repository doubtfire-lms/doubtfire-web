import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { FileDownloaderService } from '../file-downloader/file-downloader';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit {
  @Input() pdfUrl: string;
  public pdfBlobUrl: string;

  constructor(
    @Inject(FileDownloaderService) private fileDownloader: FileDownloaderService,
    @Inject(alertService) private alerts: any
  ) {}

  ngOnInit(): void {
    this.fileDownloader.downloadBlob(
      this.pdfUrl,
      (url: string, response: HttpResponse<Blob>) => {
        this.pdfBlobUrl = url;
      },
      (error: any) => {
        this.alerts.add('danger', `Error downloading PDF. ${error}`, 6000);
      }
    );
  }
}
