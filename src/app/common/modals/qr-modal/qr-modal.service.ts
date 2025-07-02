import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {QrModalComponent} from './qr-modal.component';

@Injectable({
  providedIn: 'root',
})
export class QrModalService {
  constructor(public dialog: MatDialog) {}

  public show(qrText: string) {
    const _dialogRef = this.dialog.open(QrModalComponent, {
      data: qrText,
    });
  }
}
