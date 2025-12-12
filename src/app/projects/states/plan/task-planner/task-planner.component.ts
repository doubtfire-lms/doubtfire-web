import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {
  GanttViewType,
  GanttViewOptions,
  GanttItem,
  GanttBaselineItem,
  GanttDragEvent,
  GanttDate,
  GanttLink,
  GanttLinkType,
  NgxGanttComponent,
  GanttBarClickEvent,
} from '@worktile/gantt';
import {Project} from 'src/app/api/models/project';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {ProjectService} from 'src/app/api/services/project.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {GlobalStateService} from '../../index/global-state.service';

@Component({
  selector: 'f-task-planner',
  templateUrl: './task-planner.component.html',
  styleUrl: './task-planner.component.scss',
})
export class TaskPlannerComponent implements OnInit {
  @Input() project: Project;

  @ViewChild('gantt') ganttComponent: NgxGanttComponent;

  public viewType: GanttViewType = GanttViewType.day;

  viewOptions: GanttViewOptions;

  public allTaskPrerequisites: TaskPrerequisite[];
  public taskPrerequisites: TaskPrerequisite[];

  public originalLinks: Map<string, GanttLink[]> = new Map();

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
  ) {}

  public get gradeValues() {
    return this.gradeService.gradeValues;
  }

  public get gradeAcronyms() {
    return this.gradeService.gradeAcronyms;
  }

  public gradeString(grade: number) {
    return this.gradeService.grades[grade];
  }

  public showDatesColumn: boolean = false;

  dragMoved(event: GanttDragEvent) {
    // console.log(event);
  }

  onBarHover(item: GanttItem) {
    console.log(item);

    const ganttItem = this.items.find((i) => i.id === item.id);
    const originalColor = this.originalLinks.get(ganttItem.id);
    ganttItem.links = [...originalColor];

    ganttItem.links.forEach((linkItem) => {
      const link = linkItem as GanttLink;
      const color = link.color as {active: string; default: string};
      if (color.default.endsWith('0.1)')) {
        color.default = color.default.slice(0, -4);
        color.default += '1)';
      }
    });

    const prerequisites = this.items.filter((i) => {
      const links = i.links;
      if (typeof links === 'string') {
        return false;
      }

      return links.some((l) => typeof l !== 'string' && l.link === item.id);
    });

    prerequisites.forEach((prereq) => {
      prereq.links.forEach((linkItem) => {
        const link = linkItem as GanttLink;
        if (link.link !== item.id) {
          return;
        }
        const color = link.color as {active: string; default: string};
        if (color.default.endsWith('0.1)')) {
          color.default = color.default.slice(0, -4);
          color.default += '1)';
        }
      });
    });

    this.items = [...this.items];
  }

  onBarLeave(item: GanttItem) {
    console.log(item);

    const ganttItem = this.items.find((i) => i.id === item.id);
    ganttItem.links.forEach((linkItem) => {
      const link = linkItem as GanttLink;
      const color = link.color as {active: string; default: string};
      if (!color.default.endsWith('0.1)')) {
        color.default = color.default.slice(0, -2);
        color.default += '0.1)';
      }
    });

    const prerequisites = this.items.filter((i) => {
      const links = i.links;
      if (typeof links === 'string') {
        return false;
      }

      return links.some((l) => typeof l !== 'string' && l.link === item.id);
    });

    prerequisites.forEach((prereq) => {
      prereq.links.forEach((linkItem) => {
        const link = linkItem as GanttLink;

        if (link.link !== item.id) {
          return;
        }
        const color = link.color as {active: string; default: string};
        if (!color.default.endsWith('0.1)')) {
          color.default = color.default.slice(0, -2);
          color.default += '0.1)';
        }
      });
    });

    this.items = [...this.items];
  }

  barClick(event: GanttBarClickEvent) {}

  dragEnded(event: GanttDragEvent) {
    const item = event.item;
    const td = this.getTaskDefinition(item.id);

    const requisites = this.taskPrerequisites.filter((p) => p.prerequisiteId === td.id);
    const requisiteItems = this.items.filter((p) =>
      requisites.find((pre) => pre.taskDefinitionId == Number(p.id)),
    );

    // if (
    //   requisiteItems.length &&
    //   (this.isCloseToFeedbackDeadline(item) || this.isPastFeedbackDeadline(item))
    // ) {
    //   const task = this.project.findTaskForDefinition(td.id);

    //   item.start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
    //   item.end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);

    //   // If the task defaults are still invalid, reset them to the task definition default
    //   if (this.isCloseToFeedbackDeadline(item) || this.isPastFeedbackDeadline(item)) {
    //     item.start = this.normalizeDateUTC(td.startDate.getTime() / 1000);
    //     item.end = this.normalizeDateUTC(td.localDueDate().getTime() / 1000);
    //   }

    //   this.items = [...this.items];
    //   this.alertService.error(
    //     `You must allow enough time to submit this task because it is a prerequisite for tasks: ${requisiteItems.map((r) => this.getTaskDefinition(r.id).abbreviation).join(', ')}`,
    //     8000,
    //   );
    // }
  }

  public blockedDependents: Map<string, boolean> = new Map();

  // TODO: create a map to track errors for each task, and what their final color should currently be
  // a task can hold multiple errors, for example

  // Check to see if this task is a prerequisite for another task
  // If it is, ensure the end date on the task is before the start of its dependent task
  prerequisiteConflict(item: GanttItem) {
    if (!item.links.length) {
      return false;
    }

    let isAfterDependentStartDate: boolean = false;
    for (const ganttLink of item.links) {
      if (typeof ganttLink === 'string') {
        continue;
      }

      const ganttItem = this.items.find((i) => i.id === ganttLink.link);
      if (!ganttItem) {
        return false;
      }
      const diff = this.normalizeDateUTC(item.end) - this.normalizeDateUTC(ganttItem.end);
      const color = typeof ganttLink.color === 'string' ? ganttLink.color : ganttLink.color.default;
      // this.blockedDependents.set(ganttItem.id, false);
      // console.log(this.taskDefs().find((t) => t.id == 75));
      if (diff > 0) {
        isAfterDependentStartDate = true;
      }
      continue;

      if (color === '#0079D8') {
        // Ready for feedback
        if (diff > 0) {
          isAfterDependentStartDate = true;
          // TODO: if gantItemm is also a prerequisite to another task, they should all recursively be checked and have warnings
          // this.blockedDependents.set(ganttItem.id, true);
        } else {
          // this.blockedDependents.set(ganttItem.id, false);
        }
      } else if (color === '#31b0d5' || color === '#5BB75B') {
        // Discuss or Complete
        if (diff >= -7 * 24 * 60 * 60) {
          // We need to ensure this task is submitted a week earlier than its dependent so get it in a Discuss state
          isAfterDependentStartDate = true;
          // this.blockedDependents.set(ganttItem.id, true);
        } else {
          // this.blockedDependents.set(ganttItem.id, false);
        }
      }
    }

    if (this.blockedDependents.get(item.id) === true) {
      return true;
    }

    // const prerequisites = this.items.filter((i) => {
    //   const links = i.links;
    //   if (typeof links === 'string') {
    //     return false;
    //   }

    //   return links.some((l) => typeof l !== 'string' && l.link === i.id);
    // });

    return isAfterDependentStartDate;
  }

  isBlockedByPrerequisite(item: GanttItem) {
    if (this.blockedDependents.get(item.id) === true) {
      return true;
    }

    const prerequisites = this.items.filter((i) => {
      const links = i.links;
      if (typeof links === 'string') {
        return false;
      }

      return links.some((l) => typeof l !== 'string' && l.link === item.id);
    });

    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(item.id));

    if (td.abbreviation === 'D3') {
      // console.log(prerequisites);
    }

    for (const link of prerequisites) {
      if (this.prerequisiteConflict(link)) {
        return true;
      }
    }

    if (prerequisites.some((p) => this.blockedDependents.get(p.id) === true)) {
      // this.blockedDependents.set(item.id, true);
      return true;
    } else {
      // this.blockedDependents.set(item.id, false);
    }

    return false;
  }

  getItemClasses(item: GanttItem) {
    // call all functions so they run
    const pastDeadline = this.isPastFeedbackDeadline(item);
    const conflict = this.prerequisiteConflict(item);
    const blocked = this.isBlockedByPrerequisite(item);
    const closeDeadline = this.isCloseToFeedbackDeadline(item);

    // decide the class based on priority
    if (pastDeadline) return 'bg-[#cd3704] text-white';
    // if (conflict) return 'bg-[#eb6134] text-white';
    if (blocked) return 'bg-[#cd3704] text-black';
    if (closeDeadline) return 'bg-[#ffc53d] text-black';
    return 'bg-[#0e467b] text-white';
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

    return diff >= 0 && diff <= 3 * 24 * 60 * 60;
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

  ngOnInit(): void {
    this.viewOptions = {
      datePrecisionUnit: 'day',
      start: new GanttDate(this.earliestStartDate),
      end: new GanttDate(this.normalizeDateUTC(this.project.unit.endDate.getTime() / 1000)),
      dragPreviewDateFormat: 'MMM dd',
    };

    this.project.unit.getTaskPrerequisites().subscribe({
      next: (prereqs) => {
        this.allTaskPrerequisites = prereqs;
        this.refreshItems();
      },
      error: (error) => {
        this.alertService.error(`Failed to get task prerequisites: ${error}`, 6000);
      },
    });
  }

  refreshItems() {
    this.taskPrerequisites = this.allTaskPrerequisites.filter((pre) =>
      this.taskDefs().find((td) => td.id === pre.taskDefinitionId),
    );

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
        // progress: 0.5,
        links: this.taskPrerequisites
          .filter((p) => p.prerequisiteId === td.id)
          // .filter((p) => p.taskDefinitionId === td.id)
          .map((p) => {
            let color: string;

            switch (p.taskStatus) {
              case 'ready_for_feedback':
                color = 'rgba(0, 121, 216, 0.1)';
                // color = '#90c8fc';
                break;
              case 'complete':
                color = 'rgba(91, 183, 91, 0.1)';
                break;
              case 'discuss':
                color = 'rgba(49, 176, 213, 0.1)';
                // color = '#31b0d5';
                break;
              case 'demonstrate':
                color = 'rgba(49, 176, 213, 0.1)';
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
                // active: '#00000000',
                active: 'rgba(0, 255,0, 0)',
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

      // this.originalLinks.set(, [...(item.links as GanttLink[])]);
      const originalItem = {...item};
      this.originalLinks.set(item.id.toString(), [...(originalItem.links as GanttLink[])]);

      // console.log(this.originalLinks);
      // item.links.forEach((linkItem) => {
      //   const link = linkItem as GanttLink;
      //   (link.color as {active: string; default: string}).default += 'FC';
      // });

      this.items.push(item);
      this.items = [...this.items];

      this.ganttComponent.scrollToToday();

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
