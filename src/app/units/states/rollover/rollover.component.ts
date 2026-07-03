import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {ActivatedRoute, Router} from '@angular/router';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    MatOption,
    MatInput,
    MatDatepickerInput,
    MatHint,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatCardFooter,
    MatButton,
    DatePipe,
  ],
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
    private route: ActivatedRoute,
    private teachingPeriodService: TeachingPeriodService,
  ) {}
  ngOnInit(): void {
    this.unitId = this.unitId ?? Number(this.route.parent?.snapshot.paramMap.get('unitId'));
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
        if (this.route.parent?.snapshot.data.unit) {
          this.router.navigate(['/units', response.id, 'admin']);
          return;
        }

        this.router.navigate(['/units', response.id, 'admin']);
      },
      error: (error) => {
        this.alertService.error(`Error creating unit: ${error}`, 6000);
      },
    });
  }
}
