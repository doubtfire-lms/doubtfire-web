import { Component, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alertService, TeachingPeriod } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'rollover-teaching-period-modal',
  templateUrl: 'rollover-teaching-period-modal.html',
  styleUrls: ['rollover-teaching-period-modal.component.scss'],
})
export class RolloverTeachingPeriodModalComponent {
  teachingPeriod: any;
  teachingPeriods: any;
  rolloverTo: any = {};

  constructor(
    public dialogRef: MatDialogRef<RolloverTeachingPeriodModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(alertService) public alert: any,
    @Inject(TeachingPeriod) public TeachingPeriod: any
  ) {}

  ngOnInit() {
    this.teachingPeriod = this.data.teachingPeriod;
    this.teachingPeriods = this.TeachingPeriod.query();
  }

  rollover() {
    this.TeachingPeriod.rollover.create(
      {
        existing_teaching_period_id: this.teachingPeriod.id,
        new_teaching_period_id: this.rolloverTo,
      },
      function (createdTeachingPeriod) {
        this.teachingPeriods.loadedPeriods.push(createdTeachingPeriod);
        return this.alert.add('success', 'Teaching Period Created', 2000);
      },
      (response) => this.alert.add('danger', response.data.error, 6000)
    );
  }
}
