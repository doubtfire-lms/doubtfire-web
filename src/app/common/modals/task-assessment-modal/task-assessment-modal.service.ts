import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {TaskAssessmentModalComponent} from './task-assessment-modal.component';
import { TaskAssessmentResult } from '../../services/task-submission.service';

@Injectable({
  providedIn: 'root'
})
export class TaskAssessmentModalService {

  constructor(public dialog: MatDialog, ) { }

  public show(assessmentResult: TaskAssessmentResult) {
    let dialogRef: MatDialogRef<TaskAssessmentModalComponent, any>;
    dialogRef = this.dialog.open(TaskAssessmentModalComponent, {
      data: assessmentResult,
    });
  }
}
