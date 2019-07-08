import { Component, OnInit, Input, Inject } from '@angular/core';
import { taskService, Task, alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'extension-comment',
  templateUrl: './extension-comment.component.html',
  styleUrls: ['./extension-comment.component.scss']
})
export class ExtensionCommentComponent implements OnInit {
  @Input() comment: any;
  @Input() task: any;

  constructor(
    @Inject(alertService) private alerts: any, ) { }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  ngOnInit() {
  }

  get message() {
    const studentName = this.comment.author.name;
    if (this.comment.assessed) {
      return this.comment.extension_response;
    }
    const subject = this.isStudent ? 'You have ' : studentName + ' has ';
    const message = `requested an extension for ${this.comment.weeks_requested} ${(this.comment.weeks_requested === 1 ? 'week' : 'weeks')}.`;
    return subject + message;
  }

  get isStudent() {
    return !this.isNotStudent;
  }

  get isNotStudent() {
    return this.task.project().unit().my_role !== 'Student';
  }

  denyExtension() {
    this.task.assessExtension(this.comment.id, 0, ((result) => {
      this.task.assessed = true;
      this.task.granted = false;
      const indexToUpdate = this.task.comments.findIndex(comment => comment.id === result.data.id);
      this.task.comments[indexToUpdate] = result.data;
    }).bind(this), (error: any) => this.handleError(error));

  }

  grantExtension() {
    this.task.assessExtension(this.comment.id, 1, ((result) => {
      this.task.assessed = true;
      this.task.granted = false;
      const indexToUpdate = this.task.comments.findIndex(comment => comment.id === result.data.id);
      this.task.comments[indexToUpdate] = result.data;
    }).bind(this), (error: any) => this.handleError(error));
  }
}
