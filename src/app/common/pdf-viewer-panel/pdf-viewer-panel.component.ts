import {Component, Inject, Input, OnInit} from '@angular/core';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';

@Component({
  selector: 'pdf-viewer-panel',
  templateUrl: './pdf-viewer-panel.component.html',
  styleUrls: ['./pdf-viewer-panel.component.scss'],
  standalone: false,
})
export class PdfViewerPanelComponent implements OnInit {
  @Input() pdfUrl: string;
  @Input() footerText: string;
  @Input() resourcesUrl: string;
  @Input() hideFooter: boolean;
  constructor(@Inject(FileDownloaderService) private fileDownloader: FileDownloaderService) {}

  ngOnInit(): void {}

  downloadPdf() {
    this.fileDownloader.downloadFile(this.pdfUrl + '?as_attachment=true', 'displayed-pdf.pdf');
  }

  downloadResources() {
    this.fileDownloader.downloadFile(this.resourcesUrl, 'resources.zip');
  }

  // #$scope.$watch 'pdfUrl', (newUrl) ->
  //   #       $scope.showViewer = newUrl?
}
