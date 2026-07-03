import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {
  MatDateRangeInput,
  MatDateRangePicker,
  MatDatepickerToggle,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {TeachingPeriod} from 'src/app/api/models/teaching-period';
import {TeachingPeriodService} from 'src/app/api/services/teaching-period.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'create-new-unit-modal-content',
  templateUrl: 'create-new-unit-modal-content.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    FormsModule,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatHint,
    MatDatepickerToggle,
    MatSuffix,
    MatDateRangePicker,
    MatDialogActions,
    MatButton,
  ],
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

  public createUnit(unit: {
    unitName: string;
    unitCode: string;
    selectedTeachingPeriod: number;
  }): void {
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
      this.showDates = true;
    } else {
      this.showDates = false;
      this.selectedTeachingPeriod = teachingPeriod;
    }
  }
}
