import { Component, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alertService, analyticsService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'rollover-teaching-period-modal',
  templateUrl: 'rollover-teaching-period-modal.html',
  styleUrls: ['rollover-teaching-period-modal.scss'],
})
export class RolloverTeachingPeriodModalComponent {
  teachingPeriod: any;
  teachingPeriods: any;
  rolloverTo: any = {};

  constructor(
    public dialogRef: MatDialogRef<RolloverTeachingPeriodModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) public alert: any,
    @Inject(analyticsService) public analytics: any
  ) {}

  ngOnInit() {
    this.teachingPeriod = this.data.teachingPeriod;
    this.teachingPeriods = this.data.teachingPeriod.$query();
    console.log(this.teachingPeriod);
    console.log(this.teachingPeriods);
  }
}
