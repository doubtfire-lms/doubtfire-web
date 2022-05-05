import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  constructor(public dialog: MatDialog) {}

  public show(title: any, message: any, action: any) {
    let dialogRef: MatDialogRef<ConfirmationModalComponent, any>;
    dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        title,
        message,
        action,
      },
    });
  }
}
