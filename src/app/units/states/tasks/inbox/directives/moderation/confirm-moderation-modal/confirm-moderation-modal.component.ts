import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {FeedbackModerationActionType} from 'src/app/api/models/task';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {ConfirmModerationModalData} from './confirm-moderation-modal.service';

@Component({
  selector: 'f-confirm-moderation-modal',
  templateUrl: './confirm-moderation-modal.component.html',
  styleUrl: './confirm-moderation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    MatIcon,
    CdkScrollable,
    MatDialogContent,
    MatCheckbox,
    FormsModule,
    MatDialogActions,
    MatButton,
  ],
})
export class ConfirmModerationModalComponent implements OnInit {
  task: Task;
  title: string;
  description: string;
  action: FeedbackModerationActionType;
  showDismissAll: boolean;
  callback: (applyToAll: boolean) => void;

  dismissAllTasks: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmModerationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModerationModalData,
    private alerts: AlertService,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
    this.task = this.data.task;
    this.title = this.data.title;
    this.description = this.data.description;
    this.action = this.data.action;
    this.showDismissAll = this.data.showDismissAll;
    this.callback = this.data.callback;
  }

  public runCallback() {
    this.callback(this.dismissAllTasks);
    this.dismiss();
  }

  public dismiss() {
    this.dialogRef.close();
  }
}
