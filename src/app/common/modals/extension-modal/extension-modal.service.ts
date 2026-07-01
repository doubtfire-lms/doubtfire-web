import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {ExtensionModalComponent} from './extension-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ExtensionModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, afterApplication?: () => void) {
    const dialogRef: MatDialogRef<ExtensionModalComponent, void> = this.dialog.open(
      ExtensionModalComponent,
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
