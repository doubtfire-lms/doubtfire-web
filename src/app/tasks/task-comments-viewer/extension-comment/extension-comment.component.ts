import {Component, OnInit, Input, Inject} from '@angular/core';
import {TaskComment, Task} from 'src/app/api/models/doubtfire-model';
import {ExtensionComment} from 'src/app/api/models/task-comment/extension-comment';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'extension-comment',
  templateUrl: './extension-comment.component.html',
  styleUrls: ['./extension-comment.component.scss'],
})
export class ExtensionCommentComponent implements OnInit {
  @Input() comment: ExtensionComment;
  @Input() task: Task;

  constructor(private alerts: AlertService) {}

  private handleError(error: any) {
    this.alerts.error('Error: ' + error.data.error, 6000);
  }

  ngOnInit() {}

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
      next: (tc: TaskComment) => {
        this.alerts.success('Extension updated', 2000);
      },
      error: (response) => {
        this.handleError(response);
      },
    });
  }

  grantExtension() {
    this.comment.grant().subscribe({
      next: (tc: TaskComment) => {
        this.alerts.success('Extension updated', 2000);
      },
      error: (response) => {
        this.handleError(response);
      },
    });
  }
}
