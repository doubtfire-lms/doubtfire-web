import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { GradeTaskModalComponent } from './grade-task-modal.component';

@Injectable({
  providedIn: 'root'
})
export class GradeTaskModalService {
  constructor(
    public dialog: MatDialog,
    ) { }

  public show() {
    let dialogRef: MatDialogRef<GradeTaskModalComponent, any>;
    dialogRef = this.dialog.open(GradeTaskModalComponent, {});
  }
}
