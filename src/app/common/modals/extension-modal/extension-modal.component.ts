import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { alertService } from 'src/app/ajs-upgraded-providers';
import * as moment from 'moment';

@Component({
  selector: 'extension-modal',
  templateUrl: './extension-modal.component.html',
  styleUrls: ['./extension-modal.component.scss']
})
export class ExtensionModalComponent implements OnInit {
  weeksRequested: number;
  reason: string = '';
  constructor(public dialogRef: MatDialogRef<ExtensionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) private alerts: any, ) { }

  ngOnInit() {
    this.weeksRequested = this.minWeeksCanExtend + 1;
  }

  get newDueDate() {
    const calculatedDueDate = moment(this.data.task.targetDate()).add(this.weeksRequested, 'weeks');
    const taskDueDate = moment(this.data.task.definition.due_date);
    if (calculatedDueDate > taskDueDate) {
      return taskDueDate.format('DD of MMMM');
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
    this.data.task.applyForExtension(this.reason, this.weeksRequested,
      ((result) => {
        this.alerts.add('success', 'Extension requested.');
        this.data.task.comments.push(result.data);
        this.data.task.scrollCommentsToBottom();
      }).bind(this),
      (error) => this.alerts.add('danger', 'Error ' + error.data.error));
  }

}
