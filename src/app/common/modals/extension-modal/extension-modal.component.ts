import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { alertService } from 'src/app/ajs-upgraded-providers';
import * as moment from 'moment';

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

  submitApplication() {
    this.data.task.applyForExtension(
      this.reason,
      this.weeksRequested,
      ((result) => {
        this.alerts.add('success', 'Extension requested.', 2000);
        this.data.task.comments.push(result.data);
        this.data.task.scrollCommentsToBottom();
        if (typeof this.data.afterApplication === 'function') {
          this.data.afterApplication();
        }
      }).bind(this),
      (error) => this.alerts.add('danger', 'Error ' + error.data.error)
    );
  }
}
