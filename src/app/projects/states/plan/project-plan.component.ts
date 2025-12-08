import {Component, OnInit} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {
  GanttBaselineItem,
  GanttDate,
  GanttDragEvent,
  GanttItem,
  GanttLink,
  GanttLinkType,
  GanttViewOptions,
  GanttViewType,
} from '@worktile/gantt';
import {Project, ProjectService, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {GlobalStateService} from '../index/global-state.service';

@Component({
  selector: 'f-project-plan',
  templateUrl: 'project-plan.component.html',
  styleUrls: ['project-plan.component.scss'],
})
export class ProjectPlanComponent implements OnInit {
  public project: Project;

  public viewType: GanttViewType = GanttViewType.day;

  viewOptions: GanttViewOptions;

  public taskPrerequisites: TaskPrerequisite[];

  items: GanttItem[] = [];

  // TaskDefinition default dates for reference
  baselineItems: GanttBaselineItem[] = [];

  public get unit() {
    return this.project?.unit;
  }

  constructor(
    private globalStateService: GlobalStateService,
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
  ) {
    this.globalStateService.currentViewAndEntitySubject$.subscribe((viewAndEntity) => {
      if (viewAndEntity.viewType === 'PROJECT' && viewAndEntity.entity) {
        this.project = viewAndEntity.entity as Project;
      }
    });
  }

  public get gradeValues() {
    return this.gradeService.gradeValues;
  }

  public get gradeAcronyms() {
    return this.gradeService.gradeAcronyms;
  }

  public gradeString(grade: number) {
    return this.gradeService.grades[grade];
  }

  public selectedTargetGrade: number;

  public showDatesColumn: boolean = false;

  dragMoved(event: GanttDragEvent) {
    // console.log(event);
  }

  dragEnded(event: GanttDragEvent) {
    const item = event.item;
    const td = this.getTaskDefinition(item.id);

    const requisites = this.taskPrerequisites.filter((p) => p.prerequisiteId === td.id);
    const requisiteItems = this.items.filter((p) =>
      requisites.find((pre) => pre.taskDefinitionId == Number(p.id)),
    );

    if (
      requisiteItems.length &&
      (this.isCloseToFeedbackDeadline(item) || this.isPastFeedbackDeadline(item))
    ) {
      const task = this.project.findTaskForDefinition(td.id);

      item.start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
      item.end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);

      // If the task defaults are still invalid, reset them to the task definition default
      if (this.isCloseToFeedbackDeadline(item) || this.isPastFeedbackDeadline(item)) {
        item.start = this.normalizeDateUTC(td.startDate.getTime() / 1000);
        item.end = this.normalizeDateUTC(td.localDueDate().getTime() / 1000);
      }

      this.items = [...this.items];
      this.alertService.error(
        `You must allow enough time to submit this task because it is a prerequisite for tasks: ${requisiteItems.map((r) => this.getTaskDefinition(r.id).abbreviation).join(', ')}`,
        8000,
      );
    }
  }

  isPastFeedbackDeadline(item: GanttItem) {
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));
    const task = this.project.findTaskForDefinition(td.id);
    return item.end > task.localDeadlineDate().getTime() / 1000;
  }

  isCloseToFeedbackDeadline(item: GanttItem) {
    if (!this.unit.allowFlexibleDates) {
      return false;
    }
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));
    const task = this.project.findTaskForDefinition(td.id);

    const diff =
      this.normalizeDateUTC(task.localDeadlineDate().getTime() / 1000) -
      this.normalizeDateUTC(item.end);
    return diff >= 0 && diff <= 7 * 24 * 60 * 60;
  }

  toDateStr = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  saveTargetDates() {
    for (const item of this.items) {
      const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));
      if (!td) {
        continue;
      }
      if (this.unsavedChanges(item)) {
        this.saveTargetDate(item);
      }
    }
  }

  saveTargetDate(item: GanttItem) {
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));
    const task = this.project.findTaskForDefinition(td.id);

    task.saveTargetDates(this.toDateStr(item.start), this.toDateStr(item.end)).subscribe({
      next: (data) => {
        task.targetDueDate = data.targetDueDate;
        task.targetStartDate = data.targetStartDate;
        item.start = this.normalizeDateUTC(data.targetStartDate.getTime() / 1000);
        item.end = this.normalizeDateUTC(data.targetDueDate.getTime() / 1000);
        this.items = [...this.items];
      },
      error: (error) => {
        this.alertService.error(
          `Failed to save target date for ${td.abbreviation}: ${error}`,
          6000,
        );
      },
    });
  }

  anyUnsavedChanges() {
    return this.items.some((i) => this.unsavedChanges(i));
  }

  confirmSaveTargetDates() {
    this.confirmationModalService.show(
      'Save Task Dates?',
      `Do you want to save these new target dates for your tasks? You can always reset them to the unit's default later.`,
      () => {
        this.saveTargetDates();
      },
    );
  }

  confirmResetTargetDates() {
    this.confirmationModalService.show(
      'Reset Task Dates?',
      `Are you sure you want to reset all target dates to the unit's default? All modified dates will be reset.`,
      () => {
        this.resetTargetDates();
      },
    );
  }

  resetTargetDates() {
    // TODO: maybe an api endpoint that clears them all at once
    for (const item of this.items) {
      const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));
      if (!td) {
        continue;
      }
      const task = this.project.findTaskForDefinition(td.id);
      if (task.targetDueDate || task.targetStartDate) {
        task.saveTargetDates(null, null).subscribe({
          next: (_data) => {
            task.targetDueDate = null;
            task.targetStartDate = null;

            item.start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
            item.end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);
            this.items = [...this.items];
          },
          error: (error) => {
            this.alertService.error(
              `Failed to reset target date for ${td.abbreviation}: ${error}`,
              6000,
            );
          },
        });
      } else {
        item.start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
        item.end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);
        this.items = [...this.items];
      }
    }
  }

  normalizeDateUTC = (ts: number) => {
    const d = new GanttDate(ts * 1000);
    // const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
    return Math.floor(d.getUnixTime());
  };

  toDateString(timestamp: number | Date) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      // year: '2-digit',
    });
  }

  getTask(tdId: string) {
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(tdId));
    const task = this.project.findTaskForDefinition(td.id);

    return task;
  }

  getTaskDefinition(tdId: string) {
    const td = this.unit.taskDefinitions.find((td) => td.id === Number(tdId));
    return td;
  }

  getTaskDeadline(tdId: string) {
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(tdId));
    const task = this.project.findTaskForDefinition(td.id);
    return task?.localDeadlineDate() ?? 'N/A';
  }

  getPrerequisitesFor(tdId: string) {
    return this.taskPrerequisites.filter((p) => p.prerequisiteId === Number(tdId));
  }
  floor(value: number) {
    return Math.floor(value);
  }

  unsavedChanges(item: GanttItem) {
    const task = this.getTask(item.id);
    const start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
    const end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);

    return start !== this.normalizeDateUTC(item.start) || end !== this.normalizeDateUTC(item.end);
  }

  getTooltip(item: GanttItem) {
    const prereqs = this.getPrerequisitesFor(item.id)
      .map((p) => {
        const td = this.taskDefs().find((t) => t.id === p.taskDefinitionId);
        return `${td?.abbreviation}` || '';
      })
      .filter(Boolean);

    return `${this.toDateString(item.start)} - ${this.toDateString(item.end)}\n${
      prereqs.length ? `Required for: \n${prereqs.join(', ')}` : ''
    }`;
  }

  public get earliestStartDate() {
    const earliestTaskStartDate = Math.min(
      ...this.taskDefs().map((t) => t.startDate.getTime() / 1000),
    );
    return Math.min(this.project.unit.startDate.getTime() / 1000, earliestTaskStartDate);
  }

  onTargetGradeChange(event: MatSelectChange) {
    const previousTargetGrade = this.project.targetGrade;
    this.project.targetGrade = event.value;

    this.projectService.update(this.project).subscribe({
      next: () => {
        this.alertService.success(`Succesfully updated target grade`, 2000);
        this.refreshItems();
      },
      error: (error) => {
        this.project.targetGrade = previousTargetGrade;
        this.selectedTargetGrade = previousTargetGrade;
        this.alertService.error(`Failed to update target grade: ${error}`, 6000);
      },
    });
  }

  ngOnInit(): void {
    this.selectedTargetGrade = this.project.targetGrade;

    this.viewOptions = {
      datePrecisionUnit: 'day',
      start: new GanttDate(this.earliestStartDate),
      end: new GanttDate(this.normalizeDateUTC(this.project.unit.endDate.getTime() / 1000)),
      dragPreviewDateFormat: 'MMM dd',
    };

    this.project.unit.getTaskPrerequisites().subscribe({
      next: (prereqs) => {
        const taskPrerequisites: TaskPrerequisite[] = prereqs;
        this.taskPrerequisites = taskPrerequisites;
        this.refreshItems();
      },
      error: (error) => {
        this.alertService.error(`Failed to get task prerequisites: ${error}`, 6000);
      },
    });
  }

  refreshItems() {
    const taskDefinitions = this.taskDefs();
    this.items = [];

    for (const td of taskDefinitions) {
      const task = this.project.findTaskForDefinition(td.id);

      const item: GanttItem = {
        id: td.id.toString(),
        title: `${td.abbreviation} ${td.name}`,
        start: this.normalizeDateUTC(task.startDate.getTime() / 1000),
        end: this.normalizeDateUTC(task.localDueDate().getTime() / 1000),
        // start: Math.floor(task.startDate.getTime() / 1000),
        // end: Math.floor(task.localDueDate().getTime() / 1000),
        expandable: false,
        draggable: this.project.unit.allowFlexibleDates,
        // color: this.gradeService.gradeColors[td.targetGrade],
        expanded: false,
        color: '#3333ff',
        links: this.taskPrerequisites
          .filter((p) => p.prerequisiteId === td.id)
          // .filter((p) => p.taskDefinitionId === td.id)
          .map((p) => {
            let color: string;

            switch (p.taskStatus) {
              case 'ready_for_feedback':
                color = '#0079D8';
                // color = '#90c8fc';
                break;
              case 'complete':
                color = '#5BB75B';
                break;
              case 'discuss':
                color = '#31b0d5';
                break;
              case 'demonstrate':
                color = '#31b0d5';
                break;
              default:
                color = 'gray';
            }

            const link: GanttLink = {
              type: GanttLinkType.fs,
              link: p.taskDefinitionId.toString(),
              // link: p.prerequisiteId.toString(),
              color: {
                default: color,
                active: 'red',
              },
            };

            return link;
          }),
      };

      if (
        item.links.length &&
        (this.isCloseToFeedbackDeadline(item) || this.isPastFeedbackDeadline(item))
      ) {
        const task = this.project.findTaskForDefinition(td.id);

        item.start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
        item.end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);

        // If the task defaults are still invalid, reset them to the task definition default
        if (this.isCloseToFeedbackDeadline(item) || this.isPastFeedbackDeadline(item)) {
          item.start = this.normalizeDateUTC(td.startDate.getTime() / 1000);
          item.end = this.normalizeDateUTC(td.localDueDate().getTime() / 1000);
        }
      }

      this.items.push(item);
      this.items = [...this.items];

      // Create baseline item
      const baselineItem = {...item};
      baselineItem.start = this.normalizeDateUTC(td.startDate.getTime() / 1000);
      baselineItem.end = this.normalizeDateUTC(td.targetDate.getTime() / 1000);
      this.baselineItems.push(baselineItem);
      this.baselineItems = [...this.baselineItems];

      if (this.unsavedChanges(item)) {
        this.saveTargetDate(item);
      }
    }
  }

  public taskDefs(): TaskDefinition[] {
    if (!this.project || !this.project.unit.taskDefinitions) {
      return [];
    }

    return this.project.unit.taskDefinitions.filter((taskDef) => {
      return taskDef.targetGrade <= this.project.targetGrade;
    });
  }
}
