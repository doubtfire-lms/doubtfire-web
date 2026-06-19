import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

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
  standalone: false,
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
