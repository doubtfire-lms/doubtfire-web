import {Task} from 'src/app/api/models/task';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ExtensionModalComponent} from './extension-modal.component';

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
