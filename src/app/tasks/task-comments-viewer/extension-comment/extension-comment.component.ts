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
    @Inject(Task) private Task: any,
    @Inject(alertService) private alerts: any, ) { }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  ngOnInit() {
    console.log(this.comment);
  }

  get message() {
    const studentName = this.comment.author.name;
    if (this.comment.assessed) {
      return `Extension ${this.comment.granted ? 'granted' : 'denied'}`;
    }
    const subject = this.isStudent ? 'You have ' : studentName + ' has ';
    return subject + 'requested an extension.';
  }

  get isStudent() {
    return !this.isNotStudent;
  }

  get isNotStudent() {
    return this.task.project().unit().my_role !== 'Student';
  }

  denyExtension() {
    this.Task.assessExtension(this.task, this.comment.id, 0, () => {
      this.task.assessed = true;
      this.task.granted = false;
    }, (error: any) => this.handleError(error));

  }

  grantExtension() {
    this.Task.assessExtension(this.task, this.comment.id, 1, () => {
      this.task.assessed = true;
      this.task.granted = true;
    }, (error: any) => this.handleError(error));
  }
}
