import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {TaskAssessmentModalComponent} from './task-assessment-modal.component';
import { TaskAssessmentResult } from '../../services/task-submission.service';
import { TaskSubmissionHistoryComponent } from 'src/app/tasks/task-submission-history/task-submission-history.component';
import { NzModalService } from 'ng-zorro-antd/modal';

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
      panelClass: 'submission-history-modal'
    });
  }
}
