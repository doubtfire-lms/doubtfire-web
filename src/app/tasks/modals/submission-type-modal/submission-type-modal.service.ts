import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {
  SubmissionTypeModalComponent,
  SubmissionTypeModalData,
} from './submission-type-modal.component';

@Injectable({
  providedIn: 'root',
})
export class SubmissionTypeModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: Task) {
    const _dialogRef = this.dialog.open<SubmissionTypeModalComponent, SubmissionTypeModalData>(
      SubmissionTypeModalComponent,
      {
        autoFocus: false,
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
