import { Component, OnInit, Input, Inject } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { TaskComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';
import { ExtensionComment } from 'src/app/api/models/task-comment/extension-comment';

@Component({
  selector: 'extension-comment',
  templateUrl: './extension-comment.component.html',
  styleUrls: ['./extension-comment.component.scss'],
})
export class ExtensionCommentComponent implements OnInit {
  @Input() comment: ExtensionComment;
  @Input() task: any;

  constructor(@Inject(alertService) private alerts: any) {}

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
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
    return this.task.project().unit().my_role !== 'Student';
  }

  denyExtension() {
    this.comment.deny().subscribe(
      (tc: TaskComment) => this.alerts.add('success', 'Extension updated', 2000),
      (response) => this.handleError(response)
    );
  }

  grantExtension() {
    this.comment.grant().subscribe(
      (tc: TaskComment) => this.alerts.add('success', 'Extension updated', 2000),
      (response) => this.handleError(response)
    );
  }
}
