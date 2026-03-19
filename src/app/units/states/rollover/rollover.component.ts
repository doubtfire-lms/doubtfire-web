import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {StateService} from '@uirouter/core';
import {TeachingPeriod} from 'src/app/api/models/teaching-period';
import {Unit} from 'src/app/api/models/unit';
import {TeachingPeriodService} from 'src/app/api/services/teaching-period.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

@Component({
  selector: 'f-rollover',
  templateUrl: './rollover.component.html',
  styleUrl: './rollover.component.scss',
})
export class RolloverComponent implements OnInit {
  @Input() unitId: number;

  public unit: Unit;

  public teachingPeriods: TeachingPeriod[] = [];

  public teachingPeriod: TeachingPeriod;

  public newStartDate: Date;
  public newEndDate: Date;

  constructor(
    private globalStateService: GlobalStateService,
    private unitService: UnitService,
    private alertService: AlertService,
    private router: Router,
    private state: StateService,
    private teachingPeriodService: TeachingPeriodService,
  ) {}
  ngOnInit(): void {
    this.globalStateService.onLoad(() => {
      this.unitService.get(this.unitId).subscribe({
        next: (unit) => {
          this.unit = unit;
          this.globalStateService.setView(ViewType.UNIT, unit);
          setTimeout(() => {
            this.initUnit();
          });
        },
        error: (error) => {
          this.alertService.error(`Failed to load unit: ${error}`, 6000);
          this.router.navigateByUrl('/home');
        },
      });
    });
  }

  initUnit() {
    this.teachingPeriodService.cache.values.subscribe((periods) => {
      this.teachingPeriods = periods;
      this.teachingPeriods = periods.filter((p) => p.endDate.getTime() > Date.now());
      if (this.teachingPeriods.length) {
        this.teachingPeriod = this.teachingPeriods[this.teachingPeriods.length - 1];
      }
    });
  }

  createUnit() {
    const body = this.teachingPeriod
      ? {teaching_period_id: this.teachingPeriod.id}
      : {start_date: this.newStartDate, end_date: this.newEndDate};

    this.unit.rolloverTo(body).subscribe({
      next: (response) => {
        this.alertService.success(`Unit created`, 2000);
        this.state.go('units/admin', {unitId: response.id});
      },
      error: (error) => {
        this.alertService.error(`Error creating unit: ${error}`, 6000);
      },
    });
  }
}
