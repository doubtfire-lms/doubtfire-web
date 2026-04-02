import {Component, OnInit, Input} from '@angular/core';
import {ScormExtensionComment, TaskComment, Task} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-scorm-extension-comment',
  templateUrl: './scorm-extension-comment.component.html',
  styleUrls: ['./scorm-extension-comment.component.scss'],
})
export class ScormExtensionCommentComponent implements OnInit {
  @Input() comment: ScormExtensionComment;
  @Input() task: Task;

  constructor(private alerts: AlertService) {}

  private handleError(error: any) {
    this.alerts.error('Error: ' + error.data.error, 6000);
  }

  ngOnInit() {}

  get message() {
    const studentName = this.comment.author.name;
    if (this.comment.assessed && this.comment.granted) {
      return 'Extra attempt granted.';
    } else if (this.comment.assessed && !this.comment.granted) {
      return 'Extra attempt request rejected.';
    }
    const subject = this.isStudent ? 'You have ' : studentName + ' has ';
    const message = 'requested an extra attempt for the knowledge check.';
    return subject + message;
  }

  get isStudent() {
    return !this.isNotStudent;
  }

  get isNotStudent() {
    return this.task.unit.currentUserIsStaff;
  }

  grantExtension() {
    this.comment.grant().subscribe({
      next: (tc: TaskComment) => {
        this.alerts.success('Attempt request granted', 2000);
      },
      error: (response) => {
        this.handleError(response);
      },
    });
  }
}
