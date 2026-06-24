import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {OverseerImage, UnitService} from 'src/app/api/models/doubtfire-model';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TeachingPeriod} from 'src/app/api/models/teaching-period';
import {GradeDefinition, Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {TeachingPeriodService} from 'src/app/api/services/teaching-period.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskSubmissionService} from 'src/app/common/services/task-submission.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {D2lUnitDetailsModal} from './d2l-details-form/d2l-unit-details-form.component';

@Component({
  selector: 'f-unit-details-editor',
  templateUrl: 'unit-details-editor.component.html',
  styleUrls: ['unit-details-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitDetailsEditorComponent implements OnInit {
  @Input() unit: Unit;

  constructor(
    private teachingPeriodService: TeachingPeriodService,
    private taskDefinitionService: TaskDefinitionService,
    private doubtfireConstants: DoubtfireConstants,
    private taskSubmissionService: TaskSubmissionService,
    private d2lUnitDetailsModal: D2lUnitDetailsModal,
    private unitService: UnitService,
    private alertsService: AlertService,
    private confirmationModal: ConfirmationModalService,
  ) {}

  public teachingPeriods: TeachingPeriod[];
  public taskDefinitions: TaskDefinition[];
  public dockerImages: OverseerImage[];
  public editingGradeId: string | null = null;
  public readonly gradeDefinitionColumns = ['index', 'label', 'abbreviation', 'actions'];

  public get gradeDefinitions(): GradeDefinition[] {
    return this.unit.gradeDefinitions;
  }

  public addGrade(): void {
    this.unit.gradeDefinitions = [
      ...this.unit.gradeDefinitions,
      {
        id: `grade-${Date.now()}`,
        value: this.unit.gradeDefinitions.length - 1,
        label: 'New grade',
        abbreviation: 'NEW',
      },
    ];
    this.reindexGrades();
    this.editingGradeId = this.unit.gradeDefinitions.at(-1)?.id ?? null;
  }

  public removeGrade(index: number): void {
    const removedGradeId = this.unit.gradeDefinitions[index]?.id;
    this.unit.gradeDefinitions = this.unit.gradeDefinitions.filter(
      (_definition, definitionIndex) => definitionIndex !== index,
    );
    this.reindexGrades();
    if (this.editingGradeId === removedGradeId) {
      this.editingGradeId = null;
    }
  }

  public moveGrade(index: number, offset: -1 | 1): void {
    const targetIndex = index + offset;
    if (index <= 0 || targetIndex <= 0 || targetIndex >= this.unit.gradeDefinitions.length) {
      return;
    }

    const definitions = [...this.unit.gradeDefinitions];
    const [definition] = definitions.splice(index, 1);
    definitions.splice(targetIndex, 0, definition);
    this.unit.gradeDefinitions = definitions;
    this.reindexGrades();
  }

  public editGrade(grade: GradeDefinition): void {
    this.editingGradeId = grade.id;
  }

  public finishEditingGrade(): void {
    this.editingGradeId = null;
  }

  public updateGrade(index: number, key: 'label' | 'abbreviation', value: string): void {
    const normalizedValue = key === 'abbreviation' ? value.toUpperCase() : value;
    this.unit.gradeDefinitions = this.unit.gradeDefinitions.map((definition, definitionIndex) =>
      definitionIndex === index ? {...definition, [key]: normalizedValue} : definition,
    );
  }

  private reindexGrades(): void {
    this.unit.gradeDefinitions = this.unit.gradeDefinitions.map((definition, index) => ({
      ...definition,
      value: index - 1,
    }));
  }

  public get overseerEnabled() {
    return this.doubtfireConstants.IsOverseerEnabled;
  }

  public get d2lEnabled() {
    return this.doubtfireConstants.IsD2LEnabled;
  }

  ngOnInit(): void {
    this.teachingPeriodService.query().subscribe((periods) => {
      this.teachingPeriods = periods;
    });

    this.unit.taskDefinitionCache.values.subscribe((taskDefs) => {
      this.taskDefinitions = taskDefs;
    });

    this.taskSubmissionService.getDockerImagesAsPromise().then((images) => {
      this.dockerImages = images;
    });
  }

  addD2lData() {
    this.d2lUnitDetailsModal.open(this.unit);
  }

  saveUnit() {
    this.unitService.update(this.unit).subscribe({
      next: (_unit) => {
        this.alertsService.success('Unit updated.', 2000);
      },
      error: (response) => {
        this.alertsService.error(`Failed to update unit. ${response}`, 6000);
      },
    });
  }

  private updatingAssessInPortfolio: boolean = false;

  onToggleAssessInPortfolio(event: MatSlideToggleChange) {
    if (!event.checked || this.updatingAssessInPortfolio) {
      return false;
    }

    if (this.updatingAssessInPortfolio) {
      return;
    }

    this.updatingAssessInPortfolio = true;

    setTimeout(() => {
      this.unit.markLateSubmissionsAsAssessInPortfolio = false;
      const modal = this.confirmationModal.show(
        'Enable Assess in Portfolio?',
        `Are you sure you want to enable "Assess in Portfolio" for late submissions?
        This will update any existing Time Exceeded tasks to the "Assess in Portfolio" state.
        You will not be able to disable this setting while any tasks remain in the "Assess in Portfolio" state.`,
        () => {
          this.unit.markLateSubmissionsAsAssessInPortfolio = true;
          setTimeout(() => {
            this.updatingAssessInPortfolio = false;
          });
        },
      );
      modal.afterClosed().subscribe(() => {
        setTimeout(() => {
          this.updatingAssessInPortfolio = false;
        });
      });
    });
  }
}
