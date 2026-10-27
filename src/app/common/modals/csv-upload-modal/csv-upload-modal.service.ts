import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {UploadEvent} from 'src/app/common/services/resumable-upload.service';
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
    url: string | null,
    onSuccess?: (response: unknown) => void,
    uploader?: (files: Record<string, File>) => Observable<UploadEvent>,
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
        uploader,
      },
    });
  }
}
