import {Injectable} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {MatDialogRef, MatDialog} from '@angular/material/dialog';
import {ScormExtensionModalComponent} from './scorm-extension-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ScormExtensionModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, afterApplication?: any) {
    let dialogRef: MatDialogRef<ScormExtensionModalComponent, any>;

    dialogRef = this.dialog.open(ScormExtensionModalComponent, {
      data: {
        task,
        afterApplication,
      },
    });

    dialogRef.afterOpened().subscribe((result: any) => {});

    dialogRef.afterClosed().subscribe((result: any) => {});
  }
}
