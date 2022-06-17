import { Component, OnInit, Input, Inject } from '@angular/core';
import { FileDownloaderService } from '../file-downloader/file-downloader';

@Component({
  selector: 'pdf-viewer-panel',
  templateUrl: './pdf-viewer-panel.component.html',
  styleUrls: ['./pdf-viewer-panel.component.scss'],
})
export class PdfViewerPanelComponent implements OnInit {
  @Input() pdfUrl: string;
  @Input() footerText: string;
  @Input() resourcesUrl: string;
  @Input() hideFooter: boolean;
  constructor(@Inject(FileDownloaderService) private fileDownloader: FileDownloaderService) {}

  ngOnInit(): void {}

  downloadPdf() {
    this.fileDownloader.downloadFile(this.pdfUrl + "?as_attachment=true", 'displayed-pdf.pdf');
  }

  downloadResources() {
    this.fileDownloader.downloadFile(this.resourcesUrl, 'resources.zip');
  }

  // #$scope.$watch 'pdfUrl', (newUrl) ->
  //   #       $scope.showViewer = newUrl?
}
