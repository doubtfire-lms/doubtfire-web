import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {UploadEvent} from 'src/app/common/services/resumable-upload.service';

export interface CsvUploadFileSpec {
  name: string;
  type: string;
}

export type CsvUploadFileMap = Record<string, CsvUploadFileSpec>;

export interface CsvUploadModalData {
  title: string;
  message?: string;
  batchFiles: CsvUploadFileMap;
  url: string | null;
  onSuccess?: (response: unknown) => void;
  uploader?: (files: Record<string, File>) => Observable<UploadEvent>;
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
