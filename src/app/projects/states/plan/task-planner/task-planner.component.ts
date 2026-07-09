import {
  GanttBaselineItem,
  GanttDate,
  GanttItem,
  GanttLink,
  GanttLinkType,
  GanttPrintService,
  GanttViewOptions,
  GanttViewType,
  NgxGanttComponent,
} from '@worktile/gantt';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Project} from 'src/app/api/models/project';
import {Task} from 'src/app/api/models/task';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {TaskPrerequisiteService} from 'src/app/api/services/task-prerequisite.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {TaskPlannerPrerequisitesModalService} from './task-planner-prerequisites-modal/task-planner-prerequisites-modal.service';

interface TaskGanttItem extends GanttItem {
  start: number;
  end: number;
  highlighted?: boolean;
  taskDefinition: TaskDefinition;
  task: Task;
  originalLinks: GanttLink[];
}

@Component({
  selector: 'f-task-planner',
  templateUrl: './task-planner.component.html',
  styleUrl: './task-planner.component.scss',
  providers: [GanttPrintService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskPlannerComponent implements OnInit, AfterViewInit, OnDestroy {
  // Show a warning if the task's target end date is within this many days of the feedback deadline
  public readonly CLOSE_TO_FEEDBACK_DEADLINE_THRESHOLD = 7;
  private readonly svgNamespace = 'http://www.w3.org/2000/svg';
  private ganttHeaderObserver?: MutationObserver;

  @Input() project: Project;
  @Input() targetGrade: number;

  @ViewChild('gantt') ganttComponent: NgxGanttComponent;

  public viewType: GanttViewType = GanttViewType.day;
  public viewOptions: GanttViewOptions;

  public allTaskPrerequisites: TaskPrerequisite[];
  public taskPrerequisites: TaskPrerequisite[];

  public items: TaskGanttItem[] = [];

  // TaskDefinition default dates for reference
  public baselineItems: GanttBaselineItem[] = [];

  public animateBackground: boolean = false;
  public showDatesColumn: boolean = false;
  public hideTasksAboveTargetGrade: boolean = false;
  public overlayLines: boolean = false;

  public get unit() {
    return this.project?.unit;
  }

  private get hideTasksAboveTargetGradeStorageKey(): string {
    return `ontrack.taskPlanner.${this.project?.id ?? 'unknown'}.hideTasksAboveTargetGrade`;
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private gradeService: GradeService,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
    private taskPlannerPrerequisitesModal: TaskPlannerPrerequisitesModalService,
    private taskPrerequisiteService: TaskPrerequisiteService,
    private router: Router,
    private route: ActivatedRoute,
    private ganttPrintService: GanttPrintService,
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.setupGanttHeaderObserver());
  }

  ngOnDestroy(): void {
    this.ganttHeaderObserver?.disconnect();
  }

  public get gradeValues() {
    return this.gradeService.gradeValuesFor(this.unit);
  }

  public get gradeAcronyms() {
    return Object.fromEntries(
      this.unit.gradeDefinitions.map((definition) => [definition.value, definition.abbreviation]),
    );
  }

  public gradeString(grade: number) {
    return this.gradeService.gradeLabel(grade, this.unit);
  }

  onBarHover(item: TaskGanttItem) {
    this.setLinkColors(item, true);
  }

  onBarLeave(item: TaskGanttItem) {
    this.setLinkColors(item, false);
  }

  setLinkColors(item: TaskGanttItem, active: boolean) {
    this.overlayLines = active;

    const ganttItem = this.items.find((i) => i.id === item.id);
    ganttItem.links.forEach((linkItem) => {
      const link = linkItem as GanttLink;
      this.toggleLinkOpacity(link, active);
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
        if (link.link == item.id) {
          this.toggleLinkOpacity(link, active);
        }
      });
    });

    this.items = [...this.items];
  }

  private toggleLinkOpacity(link: GanttLink, active: boolean) {
    const color = link.color as {active: string; default: string};

    if (!active && !color.default.endsWith('0.1)')) {
      // Dim link by lowering alpha
      color.default = color.default.slice(0, -2) + '0.1)';
    } else if (active && color.default.endsWith('0.1)')) {
      // Restore full opacity
      color.default = color.default.slice(0, -4) + '1)';
    }
  }

  barClick(item: TaskGanttItem) {
    const td = item.taskDefinition;
    const prereqs = this.taskPrerequisites.filter((p) => p.prerequisiteId === td.id);
    this.taskPlannerPrerequisitesModal.show(this.project, td, prereqs);
  }

  setHideTasksAboveTargetGrade(value: boolean) {
    this.hideTasksAboveTargetGrade = value;
    localStorage.setItem(this.hideTasksAboveTargetGradeStorageKey, JSON.stringify(value));
    this.refreshItems(false);
  }

  private mapPrerequisites() {
    for (const prerequisite of this.allTaskPrerequisites) {
      prerequisite.taskDefinition = this.unit.taskDefinitions.find(
        (td) => td.id === prerequisite.taskDefinitionId,
      );
      prerequisite.prerequisite = this.unit.taskDefinitions.find(
        (td) => td.id === prerequisite.prerequisiteId,
      );
    }
    this.allTaskPrerequisites = [...this.allTaskPrerequisites];
  }

  public blockedDependents: Map<string, boolean> = new Map();

  // Check to see if this task is a prerequisite for another task
  // If it is, ensure the end date on the task is before the start of its dependent task
  prerequisiteConflict(item: TaskGanttItem) {
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
      // const color = typeof ganttLink.color === 'string' ? ganttLink.color : ganttLink.color.default;

      if (diff > 0) {
        isAfterDependentStartDate = true;
      }

      continue;

      // if (color === '#0079D8') {
      //   // Ready for feedback
      //   if (diff > 0) {
      //     isAfterDependentStartDate = true;
      //   }
      // } else if (color === '#31b0d5' || color === '#5BB75B') {
      //   // Discuss or Complete
      //   if (diff >= -7 * 24 * 60 * 60) {
      //     // We need to ensure this task is submitted a week earlier than its dependent so get it in a Discuss state
      //     isAfterDependentStartDate = true;
      //   }
      // }
    }

    return isAfterDependentStartDate;
  }

  isBlockedByPrerequisite(item: TaskGanttItem) {
    const prerequisites = this.items.filter((i) => {
      const links = i.links;
      if (typeof links === 'string') {
        return false;
      }

      return links.some((l) => typeof l !== 'string' && l.link === item.id);
    });

    for (const link of prerequisites) {
      if (this.prerequisiteConflict(link)) {
        const diff = this.normalizeDateUTC(link.end) - this.normalizeDateUTC(item.end);
        if (diff > 0) {
          return true;
        }
      }
    }

    return false;
  }

  getItemClasses(item: TaskGanttItem): string[] {
    const classes: string[] = ['gantt-bar'];
    if (this.animateBackground) {
      classes.push('flash');
    }
    if (item.highlighted) {
      classes.push('[--bar-bg:#03c6fc]');
    } else if (this.isAboveTargetGrade(item)) {
      classes.push('[--bar-bg:#9ca3af]', 'text-white');
    } else if (this.isPastFeedbackDeadline(item)) {
      classes.push('[--bar-bg:#cd3704]', 'text-white');
    } else if (this.isBlockedByPrerequisite(item)) {
      classes.push('[--bar-bg:#e88307]', 'text-black');
    } else if (this.isCloseToFeedbackDeadline(item)) {
      classes.push('[--bar-bg:#ffc53d]', 'text-black');
    } else {
      classes.push('[--bar-bg:#0e467b]', 'text-white');
    }

    return classes;
  }

  isAboveTargetGrade(item: TaskGanttItem) {
    return item.taskDefinition.targetGrade > this.targetGrade;
  }

  isPastFeedbackDeadline(item: TaskGanttItem) {
    return item.end > item.task.localDeadlineDate().getTime() / 1000;
  }

  isCloseToFeedbackDeadline(item: TaskGanttItem) {
    if (!this.unit.allowFlexibleDates) {
      return false;
    }

    const task = item.task;
    const diff =
      this.normalizeDateUTC(task.localDeadlineDate().getTime() / 1000) -
      this.normalizeDateUTC(item.end);

    return diff >= 0 && diff <= this.CLOSE_TO_FEEDBACK_DEADLINE_THRESHOLD * 24 * 60 * 60;
  }

  toDateStr = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  saveTargetDates() {
    for (const item of this.items) {
      const td = item.taskDefinition;
      if (!td) {
        continue;
      }
      if (this.unsavedChanges(item)) {
        this.saveTargetDate(item);
      }
    }
  }

  saveTargetDate(item: TaskGanttItem) {
    const td = item.taskDefinition;
    const task = item.task;

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
        this.project.resetTargetDates().subscribe({
          next: (_project) => {
            for (const task of this.project.tasks) {
              task.targetDueDate = null;
              task.targetStartDate = null;

              const item = this.items.find((item) => item.id === task.definition.id.toString());
              if (item) {
                item.start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
                item.end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);
              }
            }
            this.items = [...this.items];
          },
          error: (error) => {
            this.alertService.error(`Failed to reset target dates: ${error}`, 6000);
          },
        });
      },
    );
  }

  async saveImage() {
    const ganttEl = this.ganttComponent.element;
    const mainContainer = ganttEl.querySelector<HTMLElement>('.gantt-main-container');
    const side = ganttEl.querySelector<HTMLElement>('.gantt-side');

    if (!mainContainer || !side) {
      return;
    }

    const originalStyle = {
      width: ganttEl.style.width,
      height: ganttEl.style.height,
      overflow: ganttEl.style.overflow,
    };
    const scrollElements = Array.from(
      ganttEl.querySelectorAll<HTMLElement>(
        '.gantt-main-container, .gantt-side-container, .gantt-virtual-scroll-viewport',
      ),
    );
    const scrollPositions = scrollElements.map((element) => ({
      element,
      left: element.scrollLeft,
      top: element.scrollTop,
    }));
    const windowScrollPosition = {
      left: window.scrollX,
      top: window.scrollY,
    };

    try {
      await this.renderAllGanttBars(ganttEl);
      this.resetGanttScroll(scrollElements);
      window.scrollTo(windowScrollPosition.left, windowScrollPosition.top);
      await this.waitForStableLayout(mainContainer);

      const fullWidth = side.offsetWidth + this.ganttComponent.view.width;
      const fullHeight =
        ganttEl.offsetHeight - mainContainer.offsetHeight + mainContainer.scrollHeight;

      ganttEl.style.width = `${fullWidth}px`;
      ganttEl.style.height = `${fullHeight}px`;
      ganttEl.style.overflow = 'visible';

      this.resetGanttScroll(scrollElements);
      await this.waitForStableLayout(mainContainer);

      const canvas = await this.ganttPrintService.html2canvas();
      this.downloadCanvas(canvas, `${this.unit.code}-Task-Plan.png`);
    } catch (error) {
      this.alertService.error(`Failed to download task plan: ${error}`, 6000);
    } finally {
      ganttEl.style.width = originalStyle.width;
      ganttEl.style.height = originalStyle.height;
      ganttEl.style.overflow = originalStyle.overflow;

      await this.nextAnimationFrame();
      for (const position of scrollPositions) {
        position.element.scrollTo(position.left, position.top);
      }
      window.scrollTo(windowScrollPosition.left, windowScrollPosition.top);
    }
  }

  private resetGanttScroll(scrollElements: HTMLElement[]) {
    for (const element of scrollElements) {
      element.scrollTo(0, 0);
    }
  }

  private async waitForStableLayout(element: HTMLElement) {
    let previousSize = '';
    let stableFrames = 0;

    for (let attempt = 0; attempt < 30 && stableFrames < 3; attempt++) {
      await this.nextAnimationFrame();

      const size = `${element.offsetWidth}:${element.offsetHeight}:${element.scrollWidth}:${element.scrollHeight}`;
      if (size === previousSize) {
        stableFrames++;
      } else {
        previousSize = size;
        stableFrames = 0;
      }
    }
  }

  private async renderAllGanttBars(ganttEl: HTMLElement) {
    for (let pass = 0; pass < 4; pass++) {
      if (ganttEl.querySelectorAll('[data-gantt-id]').length >= this.items.length) {
        return;
      }

      const placeholders = Array.from(
        ganttEl.querySelectorAll<HTMLElement>('gantt-bar-placeholder'),
      );

      for (const placeholder of placeholders) {
        placeholder.scrollIntoView({
          block: 'center',
          inline: 'center',
        });
        await this.nextAnimationFrame();
        await this.nextAnimationFrame();
      }
    }

    if (ganttEl.querySelectorAll('[data-gantt-id]').length < this.items.length) {
      throw new Error('Some chart items could not be rendered');
    }
  }

  private nextAnimationFrame() {
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  private downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // normalizeDateUTC = (ts: number) => {
  //   const d = new GanttDate(ts * 1000);
  //   // const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
  //   return Math.floor(d.getUnixTime());
  // };

  normalizeDateUTC = (ts: number) => {
    const d = new GanttDate(ts * 1000);
    // d.setHours(0, 0, 0, 0);
    return Math.floor(d.startOfDay().getTime() / 1000);
  };

  // normalizeDateUTC = (ts: number) => {
  //   const d = new Date(ts * 1000);
  //   d.setHours(0, 0, 0, 0);
  //   return Math.floor(d.getTime() / 1000);
  // };

  toDateString(timestamp: number | Date) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      // year: '2-digit',
    });
  }

  unsavedChanges(item: TaskGanttItem) {
    const task = item.task;
    const start = this.normalizeDateUTC(task.startDate.getTime() / 1000);
    const end = this.normalizeDateUTC(task.localDueDate().getTime() / 1000);
    return start !== this.normalizeDateUTC(item.start) || end !== this.normalizeDateUTC(item.end);
  }

  getTooltip(item: TaskGanttItem) {
    return `${this.toDateString(item.start)} — ${this.toDateString(item.end)}`;
  }

  public get earliestStartDate() {
    const today = this.normalizeDateUTC(Date.now() / 1000);
    const tasks = this.taskDefs()
      .map((td) => this.project.findTaskForDefinition(td.id))
      .filter((t) => t?.startDate);

    if (!tasks.length) {
      return today;
    }

    const earliestTaskStart = Math.min(...tasks.map((t) => t.startDate.getTime() / 1000));

    return Math.floor(Math.min(today, earliestTaskStart));
  }

  public get latestEndDate() {
    const oneWeekInSeconds = 7 * 24 * 60 * 60;
    const tasks = this.taskDefs()
      .map((td) => this.project.findTaskForDefinition(td.id))
      .filter((t) => t?.localDueDate());

    if (!tasks.length) {
      return this.earliestStartDate + oneWeekInSeconds;
    }

    const latestTaskEnd = Math.max(...tasks.map((t) => t.localDueDate().getTime() / 1000));

    return Math.floor(latestTaskEnd) + oneWeekInSeconds;
  }

  ngOnInit(): void {
    this.loadHideTasksAboveTargetGradePreference();

    this.viewOptions = {
      precisionUnit: 'day',
      start: new GanttDate(this.earliestStartDate),
      end: new GanttDate(this.latestEndDate),
      unitWidth: 40,
      dragTooltipFormat: 'MMM dd',
    };

    this.unit.getTaskPrerequisites().subscribe({
      next: (prereqs) => {
        this.allTaskPrerequisites = prereqs;
        this.mapPrerequisites();
        for (const prerequisite of this.allTaskPrerequisites) {
          prerequisite.taskDefinition.taskPrerequisitesCache.getOrCreate(
            prerequisite.id,
            this.taskPrerequisiteService,
            prerequisite,
          );
        }

        for (const td of this.unit.taskDefinitions) {
          const prerequisites = td.taskPrerequisitesCache.currentValues;
          const definitions = this.unit.taskDefinitions;
          for (const prerequisite of prerequisites) {
            prerequisite.taskDefinition = definitions.find(
              (td) => td.id === prerequisite.taskDefinitionId,
            );
            prerequisite.prerequisite = definitions.find(
              (td) => td.id === prerequisite.prerequisiteId,
            );
          }
        }

        this.refreshItems();
      },
      error: (error) => {
        this.alertService.error(`Failed to get task prerequisites: ${error}`, 6000);
      },
    });
  }

  private loadHideTasksAboveTargetGradePreference(): void {
    const rawPreference = localStorage.getItem(this.hideTasksAboveTargetGradeStorageKey);
    try {
      this.hideTasksAboveTargetGrade = rawPreference ? JSON.parse(rawPreference) === true : false;
    } catch {
      this.hideTasksAboveTargetGrade = false;
    }
  }

  private setupGanttHeaderObserver(): void {
    const ganttElement = this.elementRef.nativeElement.querySelector('ngx-gantt');

    if (!ganttElement) {
      return;
    }

    this.ganttHeaderObserver?.disconnect();
    this.ganttHeaderObserver = new MutationObserver(() => this.formatGanttHeaderLabels());
    this.ganttHeaderObserver.observe(ganttElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    this.formatGanttHeaderLabels();
  }

  private formatGanttHeaderLabels(): void {
    this.formatGanttDayLabels();
    this.formatGanttTodayLabel();
  }

  private formatGanttDayLabels(): void {
    const dayLabels = this.elementRef.nativeElement.querySelectorAll<SVGTextElement>(
      'gantt-calendar-header .secondary-text',
    );

    dayLabels.forEach((label) => {
      if (label.querySelector('tspan')) {
        return;
      }

      const [date, day] = label.textContent?.trim().split(/\s+/) ?? [];

      if (!date || !day) {
        return;
      }

      const x = label.getAttribute('x') ?? '0';
      const dateLine = document.createElementNS(this.svgNamespace, 'tspan');
      dateLine.setAttribute('x', x);
      dateLine.textContent = date;

      const dayLine = document.createElementNS(this.svgNamespace, 'tspan');
      dayLine.setAttribute('x', x);
      dayLine.setAttribute('dy', '1.15em');
      dayLine.textContent = day;

      label.textContent = '';
      label.append(dateLine, dayLine);
    });
  }

  private formatGanttTodayLabel(): void {
    const todayLabel = this.elementRef.nativeElement.querySelector<HTMLElement>(
      'gantt-calendar-header .today-rect',
    );

    if (!todayLabel || todayLabel.querySelector('.today-weekday')) {
      return;
    }

    const today = new Date();
    const date = todayLabel.textContent?.trim() || today.getDate().toString();
    const day = new Intl.DateTimeFormat('en-US', {weekday: 'short'}).format(today);

    todayLabel.replaceChildren();

    const dateLine = document.createElement('span');
    dateLine.textContent = date;

    const dayLine = document.createElement('span');
    dayLine.classList.add('today-weekday');
    dayLine.textContent = day;

    todayLabel.append(dateLine, dayLine);
  }

  refreshItems(scroll: boolean = true) {
    this.taskPrerequisites = this.allTaskPrerequisites.filter((pre) =>
      this.taskDefs().find((td) => td.id === pre.taskDefinitionId),
    );

    const taskDefinitions = this.taskDefs();
    this.items = [];
    this.baselineItems = [];

    const _items: TaskGanttItem[] = [];
    const _baselineItems: GanttBaselineItem[] = [];

    for (const td of taskDefinitions) {
      const task = this.project.findTaskForDefinition(td.id);

      const item: TaskGanttItem = {
        id: td.id.toString(),
        title: `${td.abbreviation} ${td.name}`,
        start: this.normalizeDateUTC(task.startDate.getTime() / 1000),
        end: this.normalizeDateUTC(task.localDueDate().getTime() / 1000),
        expandable: false,
        draggable: this.project.unit.allowFlexibleDates,
        // color: this.gradeService.gradeColors[td.targetGrade],
        expanded: false,
        color: '#3333ff',
        taskDefinition: td,
        task: task,
        // progress: 0.5,
        originalLinks: [],
        links: this.taskPrerequisites
          .filter((p) => p.prerequisiteId === td.id)
          // .filter((p) => p.taskDefinitionId === td.id)
          .map((p) => {
            let color: string;

            switch (p.taskStatus) {
              case 'ready_for_feedback':
                color = 'rgba(0, 121, 216, 0.1)';
                break;
              case 'complete':
                color = 'rgba(91, 183, 91, 0.1)';
                break;
              case 'discuss':
                color = 'rgba(49, 176, 213, 0.1)';
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
                active: color,
              },
            };

            return link;
          }),
      };

      // if (
      //   item.links.length &&
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
      // }

      const originalItem = {...item};
      item.originalLinks = [...(originalItem.links as GanttLink[])];

      this.items.push(item);
      _items.push(item);

      // Create baseline item
      const tdTargetDate = td.gradeTargetDate(this.targetGrade) ?? td.targetDate;
      const tdStartDate = td.gradeStartDate(this.targetGrade) ?? td.startDate;

      const baselineItem: GanttBaselineItem = {
        id: item.id,
        start: this.normalizeDateUTC(tdStartDate.getTime() / 1000),
        end: this.normalizeDateUTC(tdTargetDate.getTime() / 1000),
      };

      _baselineItems.push(baselineItem);

      // if (this.unsavedChanges(item)) {
      //   this.saveTargetDate(item);
      // }
    }

    this.items = [..._items];
    setTimeout(() => {
      this.baselineItems = [..._baselineItems];
    });

    if (scroll) {
      this.ganttComponent.scrollToToday();
    }

    const taskDef = this.route.snapshot.queryParamMap.get('taskDef');
    if (taskDef && scroll) {
      const taskItem = this.items.find((item) => item.id === taskDef);
      if (taskItem) {
        this.ganttComponent.scrollToDate(taskItem.start);
        taskItem.highlighted = true;
        this.animateBackground = true;

        setTimeout(() => {
          const el = document.querySelector(`[data-gantt-id="${taskItem.id}"]`) as HTMLElement;

          el?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        });
        setTimeout(() => (taskItem.highlighted = false), 1000);
        setTimeout(() => (this.animateBackground = false), 2000);
      }
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {taskDef: null},
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  public taskDefs(): TaskDefinition[] {
    if (!this.project || !this.project.unit.taskDefinitions) {
      return [];
    }

    return this.project.unit.taskDefinitions
      .filter(
        (taskDef) => !this.hideTasksAboveTargetGrade || taskDef.targetGrade <= this.targetGrade,
      )
      .sort((a, b) => {
        const taskA = this.project.findTaskForDefinition(a.id);
        const taskB = this.project.findTaskForDefinition(b.id);

        const dateA = taskA?.startDate ?? a.startDate;
        const dateB = taskB?.startDate ?? b.startDate;

        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
  }
}
