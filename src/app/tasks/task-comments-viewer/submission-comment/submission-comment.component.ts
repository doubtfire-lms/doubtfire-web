import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Task, TaskComment} from 'src/app/api/models/doubtfire-model';
import {SubmissionComment} from 'src/app/api/models/task-comment/submission-comment';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'submission-comment',
  styleUrls: ['../extension-comment/extension-comment.component.scss'],
  templateUrl: './submission-comment.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionCommentComponent {
  @Input() comment: SubmissionComment;
  @Input() task: Task;

  constructor(private alerts: AlertService) {}

  private handleError(error: {data: {error: string}}) {
    this.alerts.error('Error: ' + error.data.error, 6000);
  }

  get message() {
    const studentName = this.comment.author.name;
    const subject = this.isStudent ? 'You have ' : studentName + ' has ';
    const message = `requested access to submit.'
    }.`;
    return subject + message;
  }

  get isStudent() {
    return !this.isNotStudent;
  }

  get isNotStudent() {
    return this.task.unit.currentUserIsStaff;
  }

  denySubmissionRequest() {
    this.comment.deny().subscribe({
      next: (_tc: TaskComment) => {
        this.alerts.success('Submission access updated', 2000);
      },
      error: (response) => {
        this.handleError(response);
      },
    });
  }

  grantSubmissionRequest() {
    this.comment.grant().subscribe({
      next: (_tc: TaskComment) => {
        this.alerts.success('Submission access updated', 2000);
      },
      error: (response) => {
        this.handleError(response);
      },
    });
  }
}
