import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {TaskAssessmentModalComponent} from './task-assessment-modal.component';

@Injectable({
  providedIn: 'root'
})
export class TaskAssessmentModalService {
  constructor(
    public dialog: MatDialog,
    ) { }

  public show(task: any) {
    let dialogRef: MatDialogRef<TaskAssessmentModalComponent, any>;
    dialogRef = this.dialog.open(TaskAssessmentModalComponent, {
      data: task,
      width: '80%',
      panelClass: 'submission-history-modal'
    });
  }
}
