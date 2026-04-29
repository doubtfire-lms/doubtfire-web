import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {addWeeks} from 'date-fns';
import {Subscription} from 'rxjs';
import {Grade} from 'src/app/api/models/grade';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {FeedbackTemplateService} from 'src/app/api/services/feedback-template.service';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {CsvResultModalService} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

type GradeCol = 'p' | 'c' | 'd' | 'hd';

@Component({
  selector: 'f-unit-task-editor',
  templateUrl: 'unit-task-editor.component.html',
  styleUrls: ['unit-task-editor.component.scss'],
})
export class UnitTaskEditorComponent implements OnInit, OnDestroy {
  @Input() unit: Unit;

  public taskDefinitionSource = new MatTableDataSource<TaskDefinition>([]);
  public filter: string = '';
  public selectedTaskDefinition: TaskDefinition;
  public isTaskListCollapsed: boolean = false;

  public gradeColumns: string[] = ['p', 'c', 'd', 'hd'];
  public dueDateColumns: string[] = ['taskDefinition', 'p', 'c', 'd', 'hd'];
  public dueDateSource = new MatTableDataSource<TaskDefinition>([]);

  public manageDueDates: boolean = false;

  protected gradeNames: string[] = Grade.GRADES;

  isStartAfterTarget(td: TaskDefinition, g: GradeCol): boolean {
    const start = this.getGradeStartDate(td, g);
    const target = this.getGradeDueDate(td, g);
    if (!start || !target) return false;
    return new Date(start).getTime() > new Date(target).getTime();
  }

  getGradeStartDate(td: TaskDefinition, g: GradeCol): Date | null {
    switch (g) {
      case 'p':
        return td.startDate ?? td.startDate; // fallback to existing startDate
      case 'c':
        return td.cStartDate ?? td.startDate;
      case 'd':
        return td.dStartDate ?? td.startDate;
      case 'hd':
        return td.hdStartDate ?? td.startDate;
    }
  }

  isFallbackStartDate(td: TaskDefinition, g: GradeCol): boolean {
    switch (g) {
      case 'p':
        return false; // P is always real
      case 'c':
        return !td.cStartDate;
      case 'd':
        return !td.dStartDate;
      case 'hd':
        return !td.hdStartDate;
    }
  }

  setGradeStartDate(td: TaskDefinition, g: GradeCol, value: Date | null): void {
    switch (g) {
      case 'p':
        td.startDate = value;
        break;
      case 'c':
        td.cStartDate = value;
        break;
      case 'd':
        td.dStartDate = value;
        break;
      case 'hd':
        td.hdStartDate = value;
        break;
    }

    this.saveTaskDefinition(td);
  }

  getGradeDueDate(td: TaskDefinition, g: GradeCol): Date | null {
    switch (g) {
      case 'p':
        // return td.pTargetDate ?? td.dueDate ?? null; // fallback to existing dueDate
        return td.targetDate ?? td.targetDate; // fallback to existing targetDate
      case 'c':
        return td.cTargetDate ?? td.targetDate;
      case 'd':
        return td.dTargetDate ?? td.targetDate;
      case 'hd':
        return td.hdTargetDate ?? td.targetDate;
    }
  }

  isFallbackTargetDate(td: TaskDefinition, g: GradeCol): boolean {
    switch (g) {
      case 'p':
        return false; // P is always real
      case 'c':
        return !td.cTargetDate;
      case 'd':
        return !td.dTargetDate;
      case 'hd':
        return !td.hdTargetDate;
    }
  }

  setGradeDueDate(td: TaskDefinition, g: GradeCol, value: Date | null): void {
    switch (g) {
      case 'p':
        td.targetDate = value;
        break;
      case 'c':
        td.cTargetDate = value;
        break;
      case 'd':
        td.dTargetDate = value;
        break;
      case 'hd':
        td.hdTargetDate = value;
        break;
    }

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
    if (!this.taskDefinitionSource) return;

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
      (response: any) => {
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
      (response: any) => {
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
