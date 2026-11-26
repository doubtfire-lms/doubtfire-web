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
  public readonly gradeDefinitionColumns = ['index', 'label', 'abbreviation', 'order', 'actions'];
  private editingGradeDefinitions: GradeDefinition[] | null = null;
  private newGradeId: string | null = null;

  public get gradeDefinitions(): GradeDefinition[] {
    return this.unit.gradeDefinitions;
  }

  public addGrade(): void {
    if (this.newGradeId) {
      return;
    }

    const previousDefinitions = this.cloneGradeDefinitions();
    const newGradeId = `grade-${Date.now()}`;
    this.unit.gradeDefinitions = [
      ...this.unit.gradeDefinitions,
      {
        id: newGradeId,
        value: this.unit.gradeDefinitions.length - 1,
        label: 'New grade',
        abbreviation: 'NEW',
      },
    ];
    this.reindexGrades();
    this.editingGradeDefinitions = previousDefinitions;
    this.editingGradeId = newGradeId;
    this.newGradeId = newGradeId;
  }

  public removeGrade(index: number): void {
    const grade = this.unit.gradeDefinitions[index];
    if (!grade) {
      return;
    }

    this.confirmationModal.show(
      `Delete Grade ${grade.label}`,
      'Are you sure you want to delete this grade? This will update the available grades for this unit.',
      () => {
        if (grade.id === this.newGradeId) {
          this.unit.gradeDefinitions = this.editingGradeDefinitions ?? this.cloneGradeDefinitions();
          this.editingGradeDefinitions = null;
          this.editingGradeId = null;
          this.newGradeId = null;
          return;
        }
        if (this.newGradeId) {
          return;
        }

        const previousDefinitions = this.cloneGradeDefinitions();
        this.unit.gradeDefinitions = this.unit.gradeDefinitions.filter(
          (_definition, definitionIndex) => definitionIndex !== index,
        );
        this.reindexGrades();
        if (this.editingGradeId === grade.id) {
          this.editingGradeId = null;
        }
        this.saveGradeDefinitions(previousDefinitions, 'Grade deleted.');
      },
      undefined,
      'Delete',
    );
  }

  public moveGrade(index: number, offset: -1 | 1): void {
    const targetIndex = index + offset;
    if (
      this.newGradeId ||
      index <= 0 ||
      targetIndex <= 0 ||
      targetIndex >= this.unit.gradeDefinitions.length
    ) {
      return;
    }

    const previousDefinitions = this.cloneGradeDefinitions();
    const definitions = [...this.unit.gradeDefinitions];
    const [definition] = definitions.splice(index, 1);
    definitions.splice(targetIndex, 0, definition);
    this.unit.gradeDefinitions = definitions;
    this.reindexGrades();
    this.saveGradeDefinitions(previousDefinitions, 'Grade order updated.');
  }

  public editGrade(grade: GradeDefinition): void {
    if (this.newGradeId) {
      return;
    }

    this.editingGradeDefinitions = this.cloneGradeDefinitions();
    this.editingGradeId = grade.id;
  }

  public saveGrade(): void {
    const previousDefinitions = this.editingGradeDefinitions ?? this.cloneGradeDefinitions();
    this.unit.gradeDefinitions = [...this.unit.gradeDefinitions];
    const successMessage =
      this.editingGradeId === this.newGradeId ? 'Grade added.' : 'Grade updated.';
    this.saveGradeDefinitions(previousDefinitions, successMessage, () => {
      this.editingGradeDefinitions = null;
      this.editingGradeId = null;
      this.newGradeId = null;
    });
  }

  public isAddingGrade(): boolean {
    return this.newGradeId !== null;
  }

  public updateGrade(index: number, key: 'label' | 'abbreviation', value: string): void {
    const normalizedValue = key === 'abbreviation' ? value.toUpperCase() : value;
    const definition = this.unit.gradeDefinitions[index];
    if (definition) {
      definition[key] = normalizedValue;
    }
  }

  private reindexGrades(): void {
    this.unit.gradeDefinitions = this.unit.gradeDefinitions.map((definition, index) => ({
      ...definition,
      value: index - 1,
    }));
  }

  private cloneGradeDefinitions(): GradeDefinition[] {
    return this.unit.gradeDefinitions.map((definition) => ({...definition}));
  }

  private saveGradeDefinitions(
    previousDefinitions: GradeDefinition[],
    successMessage: string,
    successAction?: () => void,
  ): void {
    const gradeDefinitions = this.cloneGradeDefinitions();
    this.unitService
      .update(this.unit, {body: {unit: {grade_definitions: gradeDefinitions}}})
      .subscribe({
        next: () => {
          successAction?.();
          this.alertsService.success(successMessage, 2000);
        },
        error: (response) => {
          this.unit.gradeDefinitions = previousDefinitions;
          if (
            !this.unit.gradeDefinitions.some((definition) => definition.id === this.editingGradeId)
          ) {
            this.editingGradeId = null;
            this.editingGradeDefinitions = null;
          }
          this.alertsService.error(`Failed to update grades. ${response}`, 6000);
        },
      });
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
