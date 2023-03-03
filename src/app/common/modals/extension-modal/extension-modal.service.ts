import { Injectable } from '@angular/core';
import { Task } from 'src/app/api/models/task';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ExtensionModalComponent } from './extension-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ExtensionModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, afterApplication?: any) {
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
