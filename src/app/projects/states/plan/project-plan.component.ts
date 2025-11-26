import {AfterViewInit, Component, OnInit} from '@angular/core';
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
import {Project, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {TaskPrerequisiteService} from 'src/app/api/services/task-prerequisite.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {GlobalStateService} from '../index/global-state.service';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {MatSelectChange} from '@angular/material/select';
import {AlertService} from 'src/app/common/services/alert.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'f-project-plan',
  templateUrl: 'project-plan.component.html',
  styleUrls: ['project-plan.component.scss'],
})
export class ProjectPlanComponent implements OnInit, AfterViewInit {
  public project: Project;

  // @ViewChild('gantt') ganttComponent: NgxGanttComponent;

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
    private taskPrerequisiteService: TaskPrerequisiteService,
  ) {
    this.globalStateService.currentViewAndEntitySubject$.subscribe((viewAndEntity) => {
      if (viewAndEntity.viewType === 'PROJECT' && viewAndEntity.entity) {
        this.project = viewAndEntity.entity as Project;
      }
    });
  }
  ngAfterViewInit(): void {
    console.log();
  }

  public showDatesColumn: boolean = false;

  onDragStarted(event: GanttDragEvent) {
    console.log('drag started', event);
    console.log(
      new Date(event.item.start * 1000).toLocaleDateString(),
      new Date(event.item.end * 1000).toLocaleDateString(),
    );
  }

  onDragEnded(event: GanttDragEvent) {
    console.log('drag ended', event);
    console.log(
      new Date(event.item.start * 1000).toLocaleDateString(),
      new Date(event.item.end * 1000).toLocaleDateString(),
    );

    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(event.item.id));

    console.log(event.item.end, td.localDeadlineDate().getTime() / 1000);
    // if (event.item.end > td.localDeadlineDate().getTime() / 1000) {
    //   event.item.color = '#eb6134';
    //   this.items = [...this.items];
    //   // alert('Your selected date is past the feedback deadline...');
    // } else {
    //   event.item.color = '#3333ff';
    //   this.items = [...this.items];
    // }
  }

  isPastFeedbackDeadline(item: GanttItem) {
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));
    return item.end > td.localDeadlineDate().getTime() / 1000;
  }

  isCloseToFeedbackDeadline(item: GanttItem) {
    if (!this.unit.allowFlexibleDates) {
      return false;
    }
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));
    const deadlineTs = this.normalizeDateUTC(td.localDeadlineDate().getTime() / 1000);
    const diff =
      this.normalizeDateUTC(td.localDeadlineDate().getTime() / 1000) -
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
      const task = this.project.findTaskForDefinition(td.id);
      if (this.unsavedChanges(item)) {
        const task = this.project.findTaskForDefinition(td.id);
        // task.targetStartDate = new Date(item.start * 1000);
        // task.targetDueDate = new Date(item.end * 1000);

        // const start = new Date(item.start * 1000);
        // const startStr = start.toISOString().substring(0, 10); // "YYYY-MM-DD"

        // const end = new Date(item.end * 1000);
        // const endStr = end.toISOString().substring(0, 10);

        console.log(this.toDateStr(item.start), this.toDateStr(item.end));

        task.saveTargetDates(this.toDateStr(item.start), this.toDateStr(item.end)).subscribe({
          next: (data) => {
            console.log(`task Updated!`);
            task.targetDueDate = data.targetDueDate;
            task.targetStartDate = data.targetStartDate;
            console.log(data.targetDueDate, data.targetStartDate);
            console.log(
              Math.floor(data.targetStartDate.getTime() / 1000),
              Math.floor(data.targetDueDate.getTime() / 1000),
            );
            console.log(item.start, item.end);
            item.start = this.normalizeDateUTC(data.targetStartDate.getTime() / 1000);
            item.end = this.normalizeDateUTC(data.targetDueDate.getTime() / 1000);
            this.items = [...this.items];
          },
          error: (error) => {
            console.error(error);
          },
        });
      }
    }
  }

  anyUnsavedChanges() {
    return this.items.some((i) => this.unsavedChanges(i));
  }

  confirmSaveTargetDates() {
    this.confirmationModalService.show(
      'Save Task Dates?',
      `Do you want to save these new target dates for your tasks? You can always reset them to the unit's default later.`,
      () => {
        this.resetTargetDates();
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
          next: (data) => {
            console.log(`task Updated!`);
            task.targetDueDate = null;
            task.targetStartDate = null;

            item.start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
            item.end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);
            this.items = [...this.items];
          },
          error: (error) => {
            console.error(error);
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

  getTaskDeadline(tdId: string) {
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(tdId));
    return td?.localDeadlineDate() ?? 'N/A';
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

  ngOnInit(): void {
    // TODO: use the baseline items to show the unit's default dates
    console.log(this.project.unit.startDate, this.project.unit.endDate);

    this.viewOptions = {
      datePrecisionUnit: 'day',
      start: new GanttDate(this.earliestStartDate),
      end: new GanttDate(this.normalizeDateUTC(this.project.unit.endDate.getTime() / 1000)),
      dragPreviewDateFormat: 'MMM dd',
    };

    console.log(this.earliestStartDate);
    console.log(Math.min(...this.taskDefs().map((t) => t.startDate.getTime())));
    const newItems: GanttItem[] = [];

    this.items = [];
    const unit = this.project.unit;
    // const taskDefinitions = unit.taskDefinitions;
    const taskDefinitions = this.taskDefs();

    this.project.unit.getTaskPrerequisites().subscribe({
      next: (prereqs) => {
        const taskPrerequisites: TaskPrerequisite[] = prereqs;
        console.log(taskPrerequisites);
        this.taskPrerequisites = taskPrerequisites;
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
            links: taskPrerequisites
              // .filter((p) => p.prerequisiteId === td.id)
              .filter((p) => p.taskDefinitionId === td.id)
              .map((p) => {
                let color: string;

                switch (p.taskStatus) {
                  case 'ready_for_feedback':
                    color = '#0079D8';
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
                  // link: p.taskDefinitionId.toString(),
                  link: p.prerequisiteId.toString(),
                  color: {
                    default: color,
                    active: 'red',
                  },
                };

                return link;
              }),
            // .map((dataItem) => dataItem.taskDefinitionId.toString()),
            // type: GanttItemType.bar,
            // links: [(td.id - 1).toString()],
          };
          // if()
          this.items.push(item);
          this.items = [...this.items];

          // Create baseline item
          const baselineItem = {...item};
          baselineItem.start = this.normalizeDateUTC(td.startDate.getTime() / 1000);
          baselineItem.end = this.normalizeDateUTC(td.targetDate.getTime() / 1000);
          this.baselineItems.push(baselineItem);
          this.baselineItems = [...this.baselineItems];

          // newItems.push(item);
          // console.log(item);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    // this.items = [...newItems];
  }

  getstuff() {
    console.log(JSON.stringify(this.items));
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
