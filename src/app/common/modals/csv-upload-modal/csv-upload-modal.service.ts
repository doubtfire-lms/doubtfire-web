import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  CsvUploadFileMap,
  CsvUploadModalComponent,
  CsvUploadModalData,
} from './csv-upload-modal.component';

@Injectable({
  providedIn: 'root',
})
export class CsvUploadModalService {
  constructor(private dialog: MatDialog) {}

  public show(
    title: string,
    message: string,
    batchFiles: CsvUploadFileMap,
    url: string,
    onSuccess?: (response: unknown) => void,
  ): void {
    this.dialog.open<CsvUploadModalComponent, CsvUploadModalData>(CsvUploadModalComponent, {
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      data: {
        title,
        message,
        batchFiles,
        url,
        onSuccess,
      },
    });
  }
}
