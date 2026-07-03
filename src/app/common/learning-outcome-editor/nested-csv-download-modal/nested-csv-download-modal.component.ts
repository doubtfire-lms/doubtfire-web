import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FileDownloaderService} from '../../file-downloader/file-downloader.service';

@Component({
  selector: 'f-nested-csv-download-modal',
  templateUrl: './nested-csv-download-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CdkScrollable,
    MatDialogContent,
    MatDialogTitle,
    MatSlideToggle,
    FormsModule,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
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
    this.dialogRef.close();
  }
}
