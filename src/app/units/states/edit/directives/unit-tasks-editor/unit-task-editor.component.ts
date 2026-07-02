import {addWeeks} from 'date-fns';
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {GradeDefinition, Unit} from 'src/app/api/models/unit';
import {FeedbackTemplateService} from 'src/app/api/services/feedback-template.service';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {
  CsvResult,
  CsvResultModalService,
} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-task-editor',
  templateUrl: 'unit-task-editor.component.html',
  styleUrls: ['unit-task-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitTaskEditorComponent implements OnInit, OnDestroy {
  @Input() unit: Unit;

  public taskDefinitionSource: MatTableDataSource<TaskDefinition> = new MatTableDataSource([]);
  public filter: string = '';
  public selectedTaskDefinition: TaskDefinition;
  public isTaskListCollapsed: boolean = false;

  public dueDateSource: MatTableDataSource<TaskDefinition> = new MatTableDataSource([]);

  public manageDueDates: boolean = false;

  protected get gradeNames(): Record<number, string> {
    return Object.fromEntries(
      this.unit.gradeDefinitions.map((definition) => [definition.value, definition.label]),
    );
  }

  public get gradeColumns(): GradeDefinition[] {
    return this.unit.gradeDefinitions.filter((definition) => definition.value >= 0);
  }

  public get dueDateColumns(): string[] {
    return [
      'taskDefinition',
      ...this.gradeColumns.map((definition) => this.gradeColumnId(definition)),
    ];
  }

  public gradeColumnId(grade: GradeDefinition): string {
    return `grade-${grade.value}`;
  }

  isStartAfterTarget(td: TaskDefinition, grade: GradeDefinition): boolean {
    const start = this.getGradeStartDate(td, grade);
    const target = this.getGradeDueDate(td, grade);
    if (!start || !target) {
      return false;
    }
    return new Date(start).getTime() > new Date(target).getTime();
  }

  getGradeStartDate(td: TaskDefinition, grade: GradeDefinition): Date | null {
    return grade.value === 0 ? td.startDate : (td.gradeStartDate(grade.value) ?? td.startDate);
  }

  isFallbackStartDate(td: TaskDefinition, grade: GradeDefinition): boolean {
    return grade.value !== 0 && !td.gradeStartDate(grade.value);
  }

  setGradeStartDate(td: TaskDefinition, grade: GradeDefinition, value: Date | null): void {
    td.setGradeStartDate(grade.value, value);
    this.saveTaskDefinition(td);
  }

  getGradeDueDate(td: TaskDefinition, grade: GradeDefinition): Date | null {
    return grade.value === 0 ? td.targetDate : (td.gradeTargetDate(grade.value) ?? td.targetDate);
  }

  isFallbackTargetDate(td: TaskDefinition, grade: GradeDefinition): boolean {
    return grade.value !== 0 && !td.gradeTargetDate(grade.value);
  }

  setGradeDueDate(td: TaskDefinition, grade: GradeDefinition, value: Date | null): void {
    td.setGradeTargetDate(grade.value, value);
    this.saveTaskDefinition(td);
  }

  constructor(
    private taskDefinitionService: TaskDefinitionService,
    private feedbackTemplateService: FeedbackTemplateService,
    private alerts: AlertService,
    private csvResultModalService: CsvResultModalService,
    private csvUploadModal: CsvUploadModalService,
    private confirmationModal: ConfirmationModalService,
  ) {
    this.taskDefinitionSource.filterPredicate = (data: TaskDefinition, filter: string) =>
      data.matches(filter);
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.unit.taskDefinitionCache.values.subscribe((taskDefinitions) => {
        this.taskDefinitionSource.data = taskDefinitions;
      }),
    );
  }

  public saveTaskDefinition(taskDefinition: TaskDefinition) {
    taskDefinition.save().subscribe({
      next: () => {
        this.alerts.success('Task Saved');
        taskDefinition.setOriginalSaveData(this.taskDefinitionService.mapping);
      },
      error: (error) => {
        this.alerts.error(`Failed to update task: ${error}`, 6000);
      },
    });
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public selectTaskDefinition(taskDefinition: TaskDefinition) {
    if (this.selectedTaskDefinition === taskDefinition) {
      return;
    }

    this.selectedTaskDefinition = taskDefinition;

    // Record original save data if none present
    if (!this.selectedTaskDefinition.hasOriginalSaveData) {
      this.selectedTaskDefinition.setOriginalSaveData(this.taskDefinitionService.mapping);
    }

    this.feedbackTemplateService
      .query({contextType: 'task_definitions', contextId: this.selectedTaskDefinition.id}, {})
      .subscribe({
        error: () => this.alerts.error('Error loading task feedback templates.'),
      });
  }

  public isSelectedTaskDefinition(taskDefinition: TaskDefinition): boolean {
    return this.selectedTaskDefinition === taskDefinition;
  }

  public toggleTaskListCollapsed(): void {
    this.isTaskListCollapsed = !this.isTaskListCollapsed;
  }

  applyFilter(filterValue: string) {
    if (!this.taskDefinitionSource) {
      return;
    }

    this.taskDefinitionSource.filter = filterValue.trim().toLowerCase();

    this.selectedTaskDefinition = null;
  }

  private guessTaskAbbreviation() {
    if (this.unit.taskDefinitions.length == 0) {
      return '1.1P';
    } else {
      const lastAbbr = this.unit.taskDefinitions[this.unit.taskDefinitions.length - 1].abbreviation;
      const regex = /(.*)(\d+)(\D*)/;
      const match = regex.exec(lastAbbr);
      if (match) {
        return `${match[1]}${parseInt(match[2]) + 1}${match[3]}`;
      } else {
        return `${lastAbbr}1`;
      }
    }
  }

  public taskDefinitionHasChanges(taskDefinition: TaskDefinition): boolean {
    return taskDefinition.hasChanges(this.taskDefinitionService.mapping);
  }

  public deleteTaskDefinition(taskDefinition: TaskDefinition) {
    this.confirmationModal.show(
      `Delete Task ${taskDefinition.abbreviation}`,
      'Are you sure you want to delete this task? This action is final and will delete student work associated with this task.',
      () => {
        this.unit.deleteTaskDefinition(taskDefinition);
        //TODO: reinstate ProgressModal.show "Deleting Task #{task.abbreviation}", 'Please wait while student projects are updated.', promise
      },
    );
  }

  public uploadTaskDefinitionsCsv() {
    this.csvUploadModal.show(
      'Upload Task Definitions as CSV',
      'Upload a CSV of task definitions.',
      {file: {name: 'Task Definition CSV Data', type: 'csv'}},
      this.unit.getTaskDefinitionBatchUploadUrl(),
      (response: CsvResult) => {
        // at least one student?
        this.csvResultModalService.show('Task Definition Import Results', response);
        if (response.success.length > 0) {
          this.unit.refresh();
        }
      },
    );
  }

  public uploadTaskResourcesZip() {
    this.csvUploadModal.show(
      'Upload Task Sheets and Resources as Zip',
      'Upload a ZIP of task sheets and resources.',
      {file: {name: 'Task Sheets and Resources', type: 'zip'}},
      this.unit.taskUploadUrl,
      (response: CsvResult) => {
        // at least one student?
        this.csvResultModalService.show('Task Sheet and Resources Import Results', response);
        if (response.success.length > 0) {
          this.unit.refresh();
        }
      },
    );
  }

  public createTaskDefinition() {
    const abbr = this.guessTaskAbbreviation();
    const task = new TaskDefinition(this.unit);

    task.name = `Task ${abbr}`;
    task.abbreviation = abbr;
    task.description = 'New Description';
    task.startDate = new Date();
    task.targetDate = addWeeks(new Date(), 2);
    task.uploadRequirements = [];
    task.weighting = 4;
    task.targetGrade = 0;
    task.restrictStatusUpdates = false;
    task.plagiarismWarnPct = 80;
    task.isGraded = false;
    task.maxQualityPts = 0;
    task.tutorialStream = this.unit.tutorialStreams[0];

    this.selectedTaskDefinition = task;
  }
}
