import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {ScormExtensionModalComponent} from './scorm-extension-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ScormExtensionModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, afterApplication?: () => void) {
    const dialogRef: MatDialogRef<ScormExtensionModalComponent, void> = this.dialog.open(
      ScormExtensionModalComponent,
      {
        data: {
          task,
          afterApplication,
        },
      },
    );

    dialogRef.afterOpened().subscribe();

    dialogRef.afterClosed().subscribe();
  }
}
