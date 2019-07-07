import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ExtensionModalComponent } from './extension-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ExtensionModalService {

  constructor(public dialog: MatDialog, ) { }

  public show(task: any, afterOpened?: any, afterClosed?: any) {
    let dialogRef: MatDialogRef<ExtensionModalComponent, any>;

    dialogRef = this.dialog.open(ExtensionModalComponent, {
      data: {
        task: task
      },
    });

    dialogRef.afterOpened().subscribe((result: any) => {
      if (typeof afterClosed !== 'undefined') {
        afterOpened()();
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (typeof afterClosed !== 'undefined') {
        afterClosed();
      }
    });
  }
}
