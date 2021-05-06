import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { alertService } from 'src/app/ajs-upgraded-providers';
import * as moment from 'moment';
import { ExtensionComment } from 'src/app/api/models/task-comment/extension-comment';
import { TaskComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';
import { AppInjector } from 'src/app/app-injector';

@Component({
  selector: 'extension-modal',
  templateUrl: './extension-modal.component.html',
  styleUrls: ['./extension-modal.component.scss'],
})
export class ExtensionModalComponent implements OnInit {
  weeksRequested: number;
  reason: string = '';
  constructor(
    public dialogRef: MatDialogRef<ExtensionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) private alerts: any
  ) {}

  ngOnInit() {
    this.weeksRequested = this.minWeeksCanExtend + 1;
    if (this.weeksRequested > this.maxWeeksCanExtend) {
      this.weeksRequested = this.maxWeeksCanExtend;
    }
  }

  get newDueDate() {
    const calculatedDueDate = this.data.task.localDueDate().add(this.weeksRequested, 'weeks');
    const taskDeadlineDate = this.data.task.definition.localDeadlineDate();
    if (calculatedDueDate > taskDeadlineDate) {
      return taskDeadlineDate.format('DD of MMMM');
    }
    return calculatedDueDate.format('DD of MMMM');
  }

  get maxWeeksCanExtend() {
    return this.data.task.maxWeeksCanExtend();
  }

  get minWeeksCanExtend() {
    return this.data.task.minWeeksCanExtend();
  }

  private scrollCommentsDown(): void {
    setTimeout(() => {
      const objDiv = document.querySelector('div.comments-body');
      // let wrappedResult = angular.element(objDiv);
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 50);
  }

  submitApplication() {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    tcs.cacheSource = this.data.task.commentCache;

    const self = this;

    tcs.requestExtension(this.reason, this.weeksRequested, this.data.task).subscribe({
      next: ((tc: TaskComment) => {
        this.alerts.add('success', 'Extension requested.', 2000);
        this.data.task.comments.push(tc);
        this.scrollCommentsDown();
        if (typeof this.data.afterApplication === 'function') {
          this.data.afterApplication();
        }
      }).bind(this),

      error: ((response: any) => {
        this.alerts.add('danger', 'Error requesting extension ' + response);
      }).bind(this),
    });
  }
}
