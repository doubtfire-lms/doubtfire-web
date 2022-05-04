import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ProgressModalComponent } from './progress-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ProgressModalService {
  constructor(public dialog: MatDialog) {}

  public show(title: any, message: any, promise: any) {
    let dialogRef: MatDialogRef<ProgressModalComponent, any>;
    dialogRef = this.dialog.open(ProgressModalComponent, {
      data: {
        title,
        message,
        promise,
      },
    });
    return promise != null ? promise.finally(() => dialogRef.close()) : undefined;
  }
}
