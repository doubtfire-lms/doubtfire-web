import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {QrModalComponent} from './qr-modal.component';

export interface QrModalData {
  qrCodeImage: string;
  caption: string;
  liveTimestamp: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class QrModalService {
  constructor(public dialog: MatDialog) {}

  public show(qrText: string, caption: string, liveTimestamp: boolean = false) {
    const _dialogRef = this.dialog.open<QrModalComponent, QrModalData>(QrModalComponent, {
      data: {
        qrCodeImage: qrText,
        liveTimestamp,
        caption,
      },
    });
  }
}
