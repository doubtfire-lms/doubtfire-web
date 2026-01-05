import {Injectable} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {TaskAssessmentModalComponent} from './task-assessment-modal.component';
import {Task} from 'src/app/api/models/task';

export interface TaskAssessmentModalData {
  task: Task;
  overseerAssessmentId: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskAssessmentModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task, overseerAssessmentId?: number) {
    this.dialog.open<TaskAssessmentModalComponent, TaskAssessmentModalData>(
      TaskAssessmentModalComponent,
      {
        data: {
          task: task,
          overseerAssessmentId,
        },
        width: '80%',
        panelClass: 'submission-history-modal',
      },
    );
  }
}
