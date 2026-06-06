import {Task} from 'src/app/api/models/task';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ScormExtensionModalComponent} from './scorm-extension-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ScormExtensionModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, afterApplication?: any) {
    const dialogRef: MatDialogRef<ScormExtensionModalComponent, any> = this.dialog.open(
      ScormExtensionModalComponent,
      {
        data: {
          task,
          afterApplication,
        },
      },
    );

    dialogRef.afterOpened().subscribe((_result: any) => {});

    dialogRef.afterClosed().subscribe((_result: any) => {});
  }
}
