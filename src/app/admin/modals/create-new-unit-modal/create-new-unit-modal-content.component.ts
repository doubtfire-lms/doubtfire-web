import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TeachingPeriod } from 'src/app/api/models/teaching-period';
import { TeachingPeriodService } from 'src/app/api/services/teaching-period.service';
import { UnitService } from 'src/app/api/services/unit.service';
import { AlertService } from 'src/app/common/services/alert.service';
@Component({
  selector: 'create-new-unit-modal-content',
  templateUrl: 'create-new-unit-modal-content.component.html',
})
export class CreateNewUnitModalContentComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<CreateNewUnitModalContentComponent>,
    private unitService: UnitService,
    private teachingPeriodsService: TeachingPeriodService,
    private alerts: AlertService,
  ) {}
  showDates = false;
  startDate: Date;
  endDate: Date;
  selectedTeachingPeriod: number = null;
  teachingPeriods: TeachingPeriod[];

  ngOnInit(): void {
    this.teachingPeriodsService.fetchAll().subscribe((teachingPeriods) => {
      this.teachingPeriods = teachingPeriods;
    });
  }

  public createUnit(unit: { unitName: string; unitCode: string; selectedTeachingPeriod: number }): void {
    let newUnit;

    if (this.selectedTeachingPeriod === null) {
      newUnit = {
        code: unit.unitCode,
        name: unit.unitName,
        start_date: this.startDate,
        end_date: this.endDate,
      };
    } else {
      newUnit = {
        code: unit.unitCode,
        name: unit.unitName,
        teaching_period_id: this.selectedTeachingPeriod,
      };
    }

    this.unitService
      .create({
        unit: newUnit,
      })
      .subscribe({
        next: (unit) => {
          this.alerts.success(`Unit ${unit.code} - ${unit.name} has been created.`);
          this.dialogRef.close(unit);
        },
        error: (error) => {
          this.alerts.error(`Unit Creation Failed: ${error}`);
        },
      });
  }
  public handleChangeTeachingPeriod(teachingPeriod: number | string): void {
    if (typeof teachingPeriod === 'string') {
      teachingPeriod = null;
      this.showDates = true;
    } else {
      this.showDates = false;
      this.selectedTeachingPeriod = teachingPeriod;
    }
  }
}
