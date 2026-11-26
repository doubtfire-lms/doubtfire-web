import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Task, TaskComment} from 'src/app/api/models/doubtfire-model';
import {ExtensionComment} from 'src/app/api/models/task-comment/extension-comment';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'extension-comment',
  templateUrl: './extension-comment.component.html',
  styleUrls: ['./extension-comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExtensionCommentComponent {
  @Input() comment: ExtensionComment;
  @Input() task: Task;

  constructor(private alerts: AlertService) {}

  private handleError(error: {data: {error: string}}) {
    this.alerts.error('Error: ' + error.data.error, 6000);
  }

  get message() {
    const studentName = this.comment.author.name;
    if (this.comment.assessed) {
      return this.comment.extensionResponse;
    }
    const subject = this.isStudent ? 'You have ' : studentName + ' has ';
    const message = `requested an extension for ${this.comment.weeksRequested} ${
      this.comment.weeksRequested === 1 ? 'week' : 'weeks'
    }.`;
    return subject + message;
  }

  get isStudent() {
    return !this.isNotStudent;
  }

  get isNotStudent() {
    return this.task.unit.currentUserIsStaff;
  }

  denyExtension() {
    this.comment.deny().subscribe({
      next: (_tc: TaskComment) => {
        this.alerts.success('Extension updated', 2000);
      },
      error: (response) => {
        this.handleError(response);
      },
    });
  }

  grantExtension() {
    this.comment.grant().subscribe({
      next: (_tc: TaskComment) => {
        this.alerts.success('Extension updated', 2000);
      },
      error: (response) => {
        this.handleError(response);
      },
    });
  }
}
