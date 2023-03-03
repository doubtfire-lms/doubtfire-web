import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
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
