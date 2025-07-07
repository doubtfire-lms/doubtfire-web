import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FileDownloaderService} from '../../file-downloader/file-downloader.service';

@Component({
  selector: 'f-nested-csv-download-modal',
  templateUrl: './nested-csv-download-modal.component.html',
})
export class NestedCsvDownloadModalComponent {
  public includeNested = false;

  constructor(
    private fileDownloaderService: FileDownloaderService,
    public dialogRef: MatDialogRef<NestedCsvDownloadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {url: string; name: string; type: string},
  ) {}

  downloadCsv() {
    this.fileDownloaderService.downloadFile(
      `${this.data.url}?includes_tlos=${this.includeNested}`,
      this.data.name,
    );
  }
}
