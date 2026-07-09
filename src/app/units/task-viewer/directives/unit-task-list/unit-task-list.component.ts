import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {Project, Task, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {TaskDefinitionNamePipe} from 'src/app/common/filters/task-definition-name.pipe';

type TaskListSortOption = 'default' | 'abbreviation' | 'targetDate' | 'startDate' | 'dueDate';

type TaskListSortDirection = 'asc' | 'desc';

interface TaskListViewPreferences {
  sortBy: TaskListSortOption;
  sortDirection: TaskListSortDirection;
  hideCompleted: boolean;
  hideAboveTargetGrade: boolean;
}

interface TaskListSortOptionView {
  value: TaskListSortOption;
  label: string;
  icon: string;
}

const DEFAULT_VIEW_PREFERENCES: TaskListViewPreferences = {
  sortBy: 'default',
  sortDirection: 'asc',
  hideCompleted: false,
  hideAboveTargetGrade: false,
};

const START_APPROACHING_DAYS = 7;

@Component({
  selector: 'f-unit-task-list',
  templateUrl: './unit-task-list.component.html',
  styleUrls: ['./unit-task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FUnitTaskListComponent implements OnChanges, OnInit {
  @Input() mode: 'project' | 'all-tasks';
  @Input() project: Project;
  @Input() taskDefinitions: readonly TaskDefinition[];
  @Input() tasks: readonly Task[];
  @Input() isCollapsed = false;
  @Input() selectionUrlBase: unknown[] | null = null;

  @HostBinding('class.collapsed')
  public get collapsedHostClass(): boolean {
    return this.isCollapsed;
  }

  // What is the selected task definition
  @Input() selectedTaskDefinition$: BehaviorSubject<TaskDefinition>;
  selectedTaskDef: TaskDefinition;

  // @Output() selectedTask: EventEmitter<Task> = new EventEmitter<Task>();

  filteredTaskDefinitions: TaskDefinition[]; // list of tasks which match the taskSearch term
  searchText: string = ''; // task search term from user input
  taskDefinitionNamePipe = new TaskDefinitionNamePipe();
  viewPreferences: TaskListViewPreferences = {...DEFAULT_VIEW_PREFERENCES};
  sortOptions: TaskListSortOptionView[] = [
    {value: 'default', label: 'Priority', icon: 'sort'},
    {value: 'startDate', label: 'Start date', icon: 'event_available'},
    {value: 'targetDate', label: 'Target date', icon: 'event'},
    {value: 'dueDate', label: 'Due date', icon: 'event_repeat'},
    {value: 'abbreviation', label: 'Abbreviation', icon: 'sort_by_alpha'},
  ];

  protected get gradeNames(): Record<number, string> {
    const unit = this.project?.unit ?? this.taskDefinitions?.[0]?.unit;
    return Object.fromEntries(
      (unit?.gradeDefinitions ?? []).map((definition) => [definition.value, definition.label]),
    );
  }

  constructor(
    private angularRouter: Router,
    private route: ActivatedRoute,
  ) {}

  applyFilters() {
    this.refreshTopTaskWeights();

    const matchingTaskDefinitions = this.taskDefinitionNamePipe.transform(
      this.taskDefinitions,
      this.searchText,
    );

    this.filteredTaskDefinitions = matchingTaskDefinitions
      .filter((taskDef) => this.shouldShowTaskDefinition(taskDef))
      .sort((a, b) => this.compareTaskDefinitions(a, b));
  }

  public setSortBy(sortBy: TaskListSortOption): void {
    const sortDirection =
      sortBy === 'default'
        ? DEFAULT_VIEW_PREFERENCES.sortDirection
        : this.viewPreferences.sortBy === sortBy
          ? this.toggledSortDirection
          : 'asc';

    this.viewPreferences = {
      ...this.viewPreferences,
      sortBy,
      sortDirection,
    };
    this.persistViewPreferences();
    this.applyFilters();
  }

  public toggleHideCompleted(value: boolean): void {
    this.viewPreferences = {
      ...this.viewPreferences,
      hideCompleted: value,
    };
    this.persistViewPreferences();
    this.applyFilters();
  }

  public toggleHideAboveTargetGrade(value: boolean): void {
    this.viewPreferences = {
      ...this.viewPreferences,
      hideAboveTargetGrade: value,
    };
    this.persistViewPreferences();
    this.applyFilters();
  }

  public resetViewPreferences(): void {
    this.viewPreferences = {...DEFAULT_VIEW_PREFERENCES};
    this.persistViewPreferences();
    this.applyFilters();
  }

  public get selectedSortLabel(): string {
    const label =
      this.sortOptions.find((option) => option.value === this.viewPreferences.sortBy)?.label ??
      'Priority';

    if (this.viewPreferences.sortBy === 'default') {
      return label;
    }

    return `${label} ${this.viewPreferences.sortDirection}`;
  }

  public sortStateIconFor(option: TaskListSortOptionView): string {
    if (option.value === 'default') {
      return this.viewPreferences.sortBy === 'default' ? 'check' : '';
    }

    if (this.viewPreferences.sortBy !== option.value) {
      return '';
    }

    return this.viewPreferences.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  public get activeViewPreferenceCount(): number {
    return (
      (this.viewPreferences.sortBy !== 'default' ? 1 : 0) +
      (this.viewPreferences.hideCompleted ? 1 : 0) +
      (this.viewPreferences.hideAboveTargetGrade ? 1 : 0)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('project' in changes || 'taskDefinitions' in changes) {
      this.loadViewPreferences();
    }

    if ('project' in changes || 'taskDefinitions' in changes || 'tasks' in changes) {
      this.applyFilters();

      if (
        this.selectedTaskDef &&
        !this.filteredTaskDefinitions?.some((taskDef) => taskDef.id === this.selectedTaskDef.id)
      ) {
        this.selectedTaskDefinition$.next(null);
      }
    }
  }

  public get hasTasks(): boolean {
    return this.tasks && this.tasks.length > 0;
  }

  public taskForTaskDef(taskDef: TaskDefinition): Task {
    if (!this.hasTasks || !taskDef) {
      return null;
    }

    return this.tasks.find((task) => task.definition.id === taskDef?.id);
  }

  public taskListItem(taskDef: TaskDefinition): Task {
    return this.taskForTaskDef(taskDef);
  }

  public taskStartApproaching(task: Task): boolean {
    return (
      !!task &&
      !task.inFinalState() &&
      task.isBeforeStartDate() &&
      task.daysUntilStartDate() <= START_APPROACHING_DAYS
    );
  }

  public taskStartLabel(task: Task): string {
    const days = task.daysUntilStartDate();

    if (days <= 0) {
      return 'Start today';
    }

    return `Start in ${days} ${days === 1 ? 'day' : 'days'}`;
  }

  public taskOngoing(task: Task): boolean {
    if (!task || task.inFinalState()) {
      return false;
    }

    const now = Date.now();
    const startTime = this.dateTime(task.startDate);
    const dueTime = this.dateTime(task.localDueDate());

    return now >= startTime && now < dueTime;
  }

  /*
    TODO: There's still an issue where loading the route for the first time will cause child components (like task-dashboard) to load trigger OnInit and OnChanges twice...
    Causing duplicate queries to submission_details and task comments.
    One hack would be to always keep the task-dashboard rendered using [hidden].
  */

  ngOnInit(): void {
    this.loadViewPreferences();
    this.applyFilters();

    // Watch for changes in the selected task definition... including from us
    this.selectedTaskDefinition$.subscribe((taskDef) => {
      this.selectedTaskDef = taskDef;
    });

    // // TODO: Remove the service
    // this.taskViewerService.selectedTaskDef.subscribe((taskDef) => {
    //   this.selectedTaskDef = taskDef;
    // });

    // this.taskViewerService.taskSelected.subscribe((taskSelected) => {
    //   this.taskSelected = taskSelected;
    // });

    // // Select the first task definition by default
    // if (this.taskDefinitions.length > 0) {
    //   this.setSelectedTaskDefinition(this.taskDefinitions[0]);
    // }

    // Load selected task from URL
    const current = this.selectedTaskDefinition$.value;
    const param = this.route.snapshot.paramMap.get('taskAbbreviation');

    queueMicrotask(() => {
      if (param) {
        const taskDef = this.taskDefinitions.find((t) => t.abbreviation === param);

        if (taskDef !== current) {
          this.selectedTaskDefinition$.next(taskDef);
        }
      } else if (current !== null) {
        this.selectedTaskDefinition$.next(null);
      }
    });
  }

  setSelectedTaskDefinition(taskDef: TaskDefinition) {
    if (this.isSelectedTaskDefinition(taskDef)) {
      this.selectedTaskDefinition$.next(null);
      this.replaceSelectionUrl(null);
    } else {
      this.selectedTaskDefinition$.next(taskDef);
      this.replaceSelectionUrl(taskDef);
    }

    // this.selectedTaskDefinition.emit(taskDef);
    // const selectedTask = this.taskForTaskDef(taskDef);
    // if (selectedTask) {
    //   this.selectedTask$.next(selectedTask);
    // }

    //TODO: remove
    // this.taskViewerService.setSelectedTaskDef(taskDef);
  }

  public isSelectedTaskDefinition(taskDef: TaskDefinition): boolean {
    return this.selectedTaskDef?.id === taskDef?.id;
  }

  private replaceSelectionUrl(taskDef: TaskDefinition | null): void {
    const urlTree = this.buildSelectionUrlTree(taskDef);
    if (!urlTree) {
      return;
    }

    this.angularRouter.navigateByUrl(urlTree, {replaceUrl: true});
  }

  private buildSelectionUrlTree(taskDef: TaskDefinition | null) {
    if (this.selectionUrlBase) {
      return this.angularRouter.createUrlTree(
        taskDef ? [...this.selectionUrlBase, taskDef.abbreviation] : this.selectionUrlBase,
      );
    }

    const unitId = this.route.parent?.snapshot.paramMap.get('unitId');
    if (this.route.parent?.snapshot.data.unit && unitId) {
      return this.angularRouter.createUrlTree(
        taskDef ? ['/units', unitId, 'tasks', taskDef.abbreviation] : ['/units', unitId, 'tasks'],
      );
    }

    const projectId = this.route.parent?.snapshot.paramMap.get('projectId');
    if (this.route.parent?.snapshot.data.project && projectId) {
      return this.angularRouter.createUrlTree(
        taskDef
          ? ['/projects', projectId, 'dashboard', taskDef.abbreviation]
          : ['/projects', projectId, 'dashboard'],
      );
    }

    return null;
  }

  private shouldShowTaskDefinition(taskDef: TaskDefinition): boolean {
    if (!taskDef) {
      return false;
    }

    const task = this.taskForTaskDef(taskDef);

    if (this.viewPreferences.hideCompleted && task?.inFinalState() && !this.hasNewComments(task)) {
      return false;
    }

    return !(
      this.viewPreferences.hideAboveTargetGrade &&
      this.project?.targetGrade !== undefined &&
      this.project?.targetGrade !== null &&
      taskDef.targetGrade > this.project.targetGrade
    );
  }

  private hasNewComments(task: Task): boolean {
    return (task?.numNewComments ?? 0) > 0;
  }

  private compareTaskDefinitions(a: TaskDefinition, b: TaskDefinition): number {
    let result: number;

    switch (this.viewPreferences.sortBy) {
      case 'abbreviation':
        result = this.compareStrings(a?.abbreviation, b?.abbreviation);
        break;
      case 'targetDate':
        result = this.compareDates(this.targetDateFor(a), this.targetDateFor(b));
        break;
      case 'startDate':
        result = this.compareDates(this.startDateFor(a), this.startDateFor(b));
        break;
      case 'dueDate':
        result = this.compareDates(this.feedbackDateFor(a), this.feedbackDateFor(b));
        break;
      default:
        result = this.defaultSortWeightFor(a) - this.defaultSortWeightFor(b);
    }

    return this.viewPreferences.sortDirection === 'asc' ? result : result * -1;
  }

  private refreshTopTaskWeights(): void {
    if (this.project && this.hasTasks) {
      this.project.calcTopTasks();
    }
  }

  private defaultSortWeightFor(taskDef: TaskDefinition): number {
    return this.taskForTaskDef(taskDef)?.topWeight ?? taskDef?.seq ?? Number.MAX_SAFE_INTEGER;
  }

  private targetDateFor(taskDef: TaskDefinition): Date {
    return this.taskForTaskDef(taskDef)?.localDueDate() ?? taskDef?.targetDate;
  }

  private startDateFor(taskDef: TaskDefinition): Date {
    return this.taskForTaskDef(taskDef)?.startDate ?? taskDef?.startDate;
  }

  private feedbackDateFor(taskDef: TaskDefinition): Date {
    return this.taskForTaskDef(taskDef)?.localDeadlineDate() ?? taskDef?.localDeadlineDate();
  }

  private compareDates(a: Date, b: Date): number {
    const aTime = this.dateTime(a);
    const bTime = this.dateTime(b);

    if (aTime === bTime) {
      return 0;
    }

    return aTime - bTime;
  }

  private compareStrings(a: string, b: string): number {
    return (a ?? '').localeCompare(b ?? '', undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  private dateTime(date: Date): number {
    const time = date ? new Date(date).getTime() : NaN;
    return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
  }

  private loadViewPreferences(): void {
    const rawPreferences = localStorage.getItem(this.viewPreferencesStorageKey);

    if (!rawPreferences) {
      this.viewPreferences = {...DEFAULT_VIEW_PREFERENCES};
      return;
    }

    try {
      const parsedPreferences = JSON.parse(rawPreferences) as Partial<TaskListViewPreferences>;
      const migratedSort = this.migrateSortOption(parsedPreferences.sortBy);
      this.viewPreferences = {
        sortBy: migratedSort.sortBy,
        sortDirection: this.isSortDirection(parsedPreferences.sortDirection)
          ? parsedPreferences.sortDirection
          : migratedSort.sortDirection,
        hideCompleted: !!parsedPreferences.hideCompleted,
        hideAboveTargetGrade: !!parsedPreferences.hideAboveTargetGrade,
      };
    } catch {
      this.viewPreferences = {...DEFAULT_VIEW_PREFERENCES};
    }
  }

  private persistViewPreferences(): void {
    localStorage.setItem(this.viewPreferencesStorageKey, JSON.stringify(this.viewPreferences));
  }

  private isSortOption(value: unknown): value is TaskListSortOption {
    return this.sortOptions.some((option) => option.value === value);
  }

  private isSortDirection(value: unknown): value is TaskListSortDirection {
    return value === 'asc' || value === 'desc';
  }

  private migrateSortOption(value: unknown): {
    sortBy: TaskListSortOption;
    sortDirection: TaskListSortDirection;
  } {
    if (this.isSortOption(value)) {
      return {sortBy: value, sortDirection: DEFAULT_VIEW_PREFERENCES.sortDirection};
    }

    const migrations: Record<
      string,
      {sortBy: TaskListSortOption; sortDirection: TaskListSortDirection}
    > = {
      abbreviationAsc: {sortBy: 'abbreviation', sortDirection: 'asc'},
      abbreviationDesc: {sortBy: 'abbreviation', sortDirection: 'desc'},
      targetDateAsc: {sortBy: 'targetDate', sortDirection: 'asc'},
      targetDateDesc: {sortBy: 'targetDate', sortDirection: 'desc'},
      startDateAsc: {sortBy: 'startDate', sortDirection: 'asc'},
      startDateDesc: {sortBy: 'startDate', sortDirection: 'desc'},
      feedbackDateAsc: {sortBy: 'dueDate', sortDirection: 'asc'},
      feedbackDateDesc: {sortBy: 'dueDate', sortDirection: 'desc'},
    };

    return migrations[value as string] ?? DEFAULT_VIEW_PREFERENCES;
  }

  private get toggledSortDirection(): TaskListSortDirection {
    return this.viewPreferences.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  private get viewPreferencesStorageKey(): string {
    const unitId = this.project?.unit?.id ?? this.taskDefinitions?.[0]?.unit?.id ?? 'unknown';
    return `ontrack.unitTaskList.${unitId}.viewPreferences`;
  }
}
