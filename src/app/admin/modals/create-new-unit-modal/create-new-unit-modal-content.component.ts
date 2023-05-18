import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { MatDialogRef } from '@angular/material/dialog';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { analyticsService } from 'src/app/ajs-upgraded-providers';
@Component({
  selector: 'create-new-unit-modal-content',
  templateUrl: 'create-new-unit-modal-content.component.html',
})
export class CreateNewUnitModalContent {
  constructor(
    private http: HttpClient,
    private constants: DoubtfireConstants,
    private dialogRef: MatDialogRef<CreateNewUnitModalContent>,
    @Inject(alertService) private alerts: any,
    @Inject(analyticsService) private AnalyticsService: any
  ) {}
  showDates = false;
  startDate: Date;
  endDate: Date;
  selectedTeachingPeriod: number;
  teachingPeriods: object[] = [
    { id: null, name: 'Custom date' },
    { id: 1, name: 'T1' },
    { id: 2, name: 'T2' },
    { id: 3, name: 'T3' },
  ];
  public createUnit(unit: { unitName: string; unitCode: string; teachingPeriod: number }): void {
    this.AnalyticsService.event('Unit Admin', 'Started to Create Unit');
    this.http
      .post(
        `${this.constants.API_URL}/units`,
        this.formatPostBody(unit.unitName, unit.unitCode, this.selectedTeachingPeriod)
      )
      .subscribe({
        next: () => {
          this.dialogRef.close();
          this.alerts.add('success', 'Unit successfully created', 2000);
        },
        error: (err) => {
          this.AnalyticsService.event('danger', `Error creating unit - ${err.data.error}`);
        },
        complete: () => {
          this.AnalyticsService.event('Unit Admin', 'Saved New Unit');
          window.location.reload();
        },
      });
  }
  public handleChangeTeachingPeriod(event: number): void {
    if (event == null) {
      this.showDates = true;
      this.startDate = new Date();
      this.endDate = new Date();
      this.selectedTeachingPeriod = 0;
      return;
    }
    [this.startDate, this.endDate] = this.getTeachingPeriodDates(event);
    this.selectedTeachingPeriod = event;
    this.showDates = false;
    return;
  }
  private formatPostBody(unitName: string, unitCode: string, teachingPeriod: number) {
    if (teachingPeriod) {
      return {
        unit: {
          name: unitName,
          code: unitCode,
          teaching_period_id: teachingPeriod,
        },
      };
    }
    return {
      unit: {
        name: unitName,
        code: unitCode,
        start_date: this.startDate,
        end_date: this.endDate,
      },
    };
  }
  private getTeachingPeriodDates(teachingPeriodId: number): Date[] {
    if (teachingPeriodId == 1) return [new Date('2018-03-05'), new Date('2018-05-25')];
    if (teachingPeriodId == 2) return [new Date('2018-07-09'), new Date('2018-09-28')];
    if (teachingPeriodId == 3) return [new Date('2018-11-05'), new Date('2019-02-01')];
  }
}
