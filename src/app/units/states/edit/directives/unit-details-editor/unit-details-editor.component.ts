import { Component, Input, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Unit, TaskDefinition, TeachingPeriod } from 'src/app/api/models/doubtfire-model';
import { AlertService } from 'src/app/common/services/alert.service';
import { TaskSubmissionService } from 'src/app/common/services/task-submission.service';
import { UnitService } from 'src/app/api/services/unit.service';
import { TeachingPeriodService } from 'src/app/api/services/teaching-period.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { D2lUnitDetailsModal } from './d2l-details-form/d2l-unit-details-form.component';
import { StateService } from '@uirouter/core';

@Component({
  selector: 'f-unit-details-editor',
  templateUrl: './unit-details-editor.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class UnitDetailsEditorComponent implements OnInit, OnDestroy {
  @Input() unit: any;

  overseerEnabled: boolean = false;
  externalName: Observable<string> | null = null;

  teachingPeriodValues: { value: TeachingPeriod | undefined; text: string }[] = [];
  taskDefinitionValues: { value: TaskDefinition | undefined; text: string }[] = [];
  dockerImages: any[] = [];

  calOptions = {
    startOpened: false,
    endOpened: false,
    portfolioAutoGenerationOpened: false,
  };

  dateOptions = {
    formatYear: 'yy',
    startingDay: 1,
  };

  studentSearch: string = '';

  private taskDefinitionSubscription: Subscription | undefined;

  constructor(
    private unitService: UnitService,
    private alertService: AlertService,
    private teachingPeriodService: TeachingPeriodService,
    private taskSubmissionService: TaskSubmissionService,
    private d2lUnitDetailsModal: D2lUnitDetailsModal,
    private doubtfireConstants: DoubtfireConstants,
    private state: StateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.overseerEnabled = this.doubtfireConstants.IsOverseerEnabled.getValue() ?? false;
    this.externalName = this.doubtfireConstants.ExternalName.pipe(map((value: string) => value)) ?? null;
    this.loadTeachingPeriods();
    this.loadTaskDefinitions();
    this.loadDockerImages();
  }

  ngOnDestroy(): void {
    if (this.taskDefinitionSubscription) {
      this.taskDefinitionSubscription.unsubscribe();
    }
  }

  loadTeachingPeriods(): void {
    this.teachingPeriodService.query().subscribe(
      (periods) => {
        this.teachingPeriodValues = [
          { value: undefined, text: 'None' },
          ...periods.map((p) => ({ value: p, text: `${p.year} ${p.period}` })),
        ];
      },
      (error) => {
        console.error('Error fetching teaching periods:', error);
      }
    );
  }

  loadTaskDefinitions(): void {
    if (!this.unit || !this.unit.taskDefinitionCache || !this.unit.taskDefinitionCache.values) {
      return;
    }

    this.taskDefinitionSubscription = this.unit.taskDefinitionCache.values.subscribe((taskDefs: TaskDefinition[]) => {
      this.taskDefinitionValues = [{ value: undefined, text: 'None' }];
      const other = taskDefs.map((td) => ({
        value: td,
        text: `${td.abbreviation}-${td.name}`,
      }));
      this.taskDefinitionValues.push(...other);
    });
  }

  loadDockerImages(): void {
    this.taskSubmissionService.getDockerImages().subscribe((images) => {
      this.dockerImages = images;
    });
  }

  teachingPeriodSelected(periodId: any): void {
    if (this.unit && periodId) {
      this.teachingPeriodService.get(periodId).subscribe(
        (period) => {
          this.unit.teachingPeriod = period;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          console.error('Error fetching teaching period:', error);
          this.unit.teachingPeriod = undefined; // Or handle the error as needed
          this.changeDetectorRef.detectChanges();
        }
      );
    } else {
      this.unit.teachingPeriod = undefined;
      this.changeDetectorRef.detectChanges();
    }
  }

  draftTaskDefSelected(task: TaskDefinition | undefined): void {
    if (this.unit) {
      this.unit.draftTaskDefinition = task;
    }
  }

  open(event: MouseEvent, pickerData: 'start' | 'end' | 'autogen'): void {
    event.preventDefault();
    event.stopPropagation();

    this.calOptions.startOpened = pickerData === 'start' ? !this.calOptions.startOpened : false;
    this.calOptions.endOpened = pickerData === 'end' ? !this.calOptions.endOpened : false;
    this.calOptions.portfolioAutoGenerationOpened = pickerData === 'autogen' ? !this.calOptions.portfolioAutoGenerationOpened : false;
  }

  saveUnit(): void {
    if (!this.unit) return;
    this.unitService.update(this.unit).subscribe({
      next: (unit) => this.alertService.success('Unit updated.', 2000),
      error: (err) => this.alertService.error(`Failed to update unit. ${err}`, 6000),
    });
  }

  addD2lData(): void {
    this.d2lUnitDetailsModal.open(this.unit);
  }

  d2lEnabled(): boolean {
    return this.doubtfireConstants.IsD2LEnabled.getValue() ?? false;
  }

  copyUnit(): void {
    if (this.unit?.id) {
      this.state.go('units/rollover', { unitId: this.unit.id });
    }
  }
}
