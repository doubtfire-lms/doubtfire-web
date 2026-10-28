import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {FeedbackModerationActionType} from 'src/app/api/models/task';
import {Task} from 'src/app/api/models/task';
import {ConfirmModerationModalComponent} from './confirm-moderation-modal.component';

export interface ConfirmModerationModalData {
  task: Task;
  title: string;
  description: string;
  action: FeedbackModerationActionType;
  showDismissAll: boolean;
  callback: (applyToAll: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmModerationModalService {
  constructor(public dialog: MatDialog) {}

  public show(
    task: Task,
    title: string,
    description: string,
    action: FeedbackModerationActionType,
    showDismissAll: boolean,
    callback: (applyToAll: boolean) => void,
  ) {
    const _dialogRef = this.dialog.open<
      ConfirmModerationModalComponent,
      ConfirmModerationModalData
    >(ConfirmModerationModalComponent, {
      data: {
        task,
        title,
        description,
        action,
        showDismissAll,
        callback,
      },
      position: {top: '2.5%'},
      width: '100%',
      maxWidth: '650px',
    });
  }
}
