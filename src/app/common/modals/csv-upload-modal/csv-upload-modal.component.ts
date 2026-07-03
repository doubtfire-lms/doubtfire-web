import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {FileUploaderComponent} from '../../file-uploader/file-uploader.component';

export interface CsvUploadFileSpec {
  name: string;
  type: string;
}

export type CsvUploadFileMap = Record<string, CsvUploadFileSpec>;

export interface CsvUploadModalData {
  title: string;
  message?: string;
  batchFiles: CsvUploadFileMap;
  url: string;
  onSuccess?: (response: unknown) => void;
}

@Component({
  selector: 'f-csv-upload-modal',
  templateUrl: './csv-upload-modal.component.html',
  styleUrls: ['./csv-upload-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    FileUploaderComponent,
    MatDialogActions,
    MatButton,
  ],
})
export class CsvUploadModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CsvUploadModalData,
    private dialogRef: MatDialogRef<CsvUploadModalComponent>,
  ) {}

  public onUploadSuccess = (response: unknown): void => {
    this.dialogRef.close();
    this.data.onSuccess?.(response);
  };

  public close(): void {
    this.dialogRef.close();
  }
}
