import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ExtensionModalComponent } from './extension-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ExtensionModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: any, afterApplication?: any) {
    let dialogRef: MatDialogRef<ExtensionModalComponent, any>;

    dialogRef = this.dialog.open(ExtensionModalComponent, {
      data: {
        task,
        afterApplication,
      },
    });

    dialogRef.afterOpened().subscribe((result: any) => {});

    dialogRef.afterClosed().subscribe((result: any) => {});
  }
}
