import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {FeedbackAppealModalComponent} from './feedback-appeal-modal.component';

export interface FeedbackAppealModalData {
  task: Task;
}

@Injectable({
  providedIn: 'root',
})
export class FeedbackAppealModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task) {
    const _dialogRef = this.dialog.open<FeedbackAppealModalComponent, FeedbackAppealModalData>(
      FeedbackAppealModalComponent,
      {
        data: {
          task: task,
        },
        position: {top: '2.5%'},
        width: '100%',
        maxWidth: '700px',
      },
    );
  }
}
