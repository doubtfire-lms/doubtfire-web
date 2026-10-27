import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {ExistingSubmissionChoiceModalComponent} from './existing-submission-choice-modal.component';

@Injectable({providedIn: 'root'})
export class ExistingSubmissionChoiceModalService {
  constructor(private dialog: MatDialog) {}

  public show(task: Task): void {
    const dialogRef = this.dialog.open<
      ExistingSubmissionChoiceModalComponent,
      Task,
      'upload' | undefined
    >(ExistingSubmissionChoiceModalComponent, {
      autoFocus: false,
      width: '100%',
      maxWidth: '620px',
      data: task,
    });

    dialogRef.afterClosed().subscribe((choice) => {
      if (choice === 'upload') {
        task.presentTaskSubmissionModal('ready_for_feedback');
      }
    });
  }
}
