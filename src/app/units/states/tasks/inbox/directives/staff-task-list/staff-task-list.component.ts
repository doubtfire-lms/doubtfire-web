/* eslint-disable no-shadow, @typescript-eslint/no-shadow */
import {HotkeysService} from '@ngneat/hotkeys';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subject, Subscription, takeUntil} from 'rxjs';
import {
  Project,
  Task,
  TaskDefinition,
  TaskStatus,
  TaskStatusEnum,
  Tutorial,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {AppInjector} from 'src/app/app-injector';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {TasksByTutorPipe} from 'src/app/common/filters/tasks-by-tutor.pipe';
import {TasksForInboxSearchPipe} from 'src/app/common/filters/tasks-for-inbox-search.pipe';
import {TasksInTutorialsPipe} from 'src/app/common/filters/tasks-in-tutorials.pipe';
import {TasksOfTaskDefinitionPipe} from 'src/app/common/filters/tasks-of-task-definition.pipe';
import {CsvResultModalService} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {CsvUploadModalService} from 'src/app/common/modals/csv-upload-modal/csv-upload-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {BatchFeedbackWorkflowDialogComponent} from './batch-feedback-workflow-dialog/batch-feedback-workflow-dialog.component';

type StaffTaskListViewType = 'inbox' | 'explorer' | 'moderation' | 'overflow';

type StaffTaskListSortOption = 'default' | 'feedbackDeadline';

type StaffTaskListSortDirection = 'asc' | 'desc';

type StaffTaskListFilterKey = 'awaitingFeedback' | 'similaritiesDetected';

interface StaffTaskListViewPreferences {
  sortBy: StaffTaskListSortOption;
  sortDirection: StaffTaskListSortDirection;
  filters: Record<StaffTaskListFilterKey, boolean>;
  statuses: TaskStatusEnum[];
}

interface StaffTaskListSortOptionView {
  value: StaffTaskListSortOption;
  label: string;
  icon: string;
  // Spells out which end of the range comes first -- an arrow alone is ambiguous for dates
  directions?: Record<StaffTaskListSortDirection, string>;
}

interface StaffTaskListFilterOptionView {
  key: StaffTaskListFilterKey;
  label: string;
  tooltip: string;
}

interface StaffTaskListStatusOptionView {
  status: TaskStatusEnum;
  label: string;
  color: string;
  count: number;
}

const DEFAULT_VIEW_PREFERENCES: StaffTaskListViewPreferences = {
  sortBy: 'default',
  sortDirection: 'asc',
  filters: {
    awaitingFeedback: false,
    similaritiesDetected: false,
  },
  statuses: [],
};

const ALL_TASK_DEFINITIONS = '';

// The inbox and overflow queue lead with the longest-waiting task, so their default
// is really a date sort and can be reversed. The other views have no ordering worth
// naming, and keep the source order the API returned.
const WAITING_TIME_DEFAULT = {
  label: 'Longest waiting',
  directions: {asc: 'Oldest first', desc: 'Newest first'} as Record<
    StaffTaskListSortDirection,
    string
  >,
};

const DEFAULT_SORT_BY_VIEW: Partial<Record<StaffTaskListViewType, typeof WAITING_TIME_DEFAULT>> = {
  inbox: WAITING_TIME_DEFAULT,
  overflow: WAITING_TIME_DEFAULT,
};

@Component({
  selector: 'df-staff-task-list',
  templateUrl: './staff-task-list.component.html',
  styleUrls: ['./staff-task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StaffTaskListComponent implements OnInit, OnChanges, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  private taskLoadSubscription?: Subscription;

  @ViewChild('searchDialog') searchDialog: TemplateRef<object>;

  @Input() task: Task;
  @Input() project: Project;

  @Input() taskData: {
    source: (
      unit: Unit,
      taskDef?: TaskDefinition | number,
      fetchMyStudentsOnly?: boolean,
    ) => Observable<Task[]>;
    selectedTask: Task | null;
    taskKey: unknown;
    onSelectedTaskChange: (task: Task | null) => void;
    taskDefMode: boolean;
  };
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() filters: Partial<{
    taskDefinition: TaskDefinition;
    tutorials: Tutorial[];
    forceStream: boolean;
    studentName: string;
    tutorialIdSelected: string | number;
    unitRoleIdSelected: number | string;
    taskDefinitionIdSelected: number | TaskDefinition | typeof ALL_TASK_DEFINITIONS;
  }>;

  @Input() isNarrow: boolean;

  @Input() viewType: StaffTaskListViewType;

  userHasTutorials: boolean;
  filteredTasks: Task[] = null;

  studentFilter: {
    id: number | string;
    inboxDescription: string;
    abbreviation: string;
    forceStream: boolean;
    tutorial?: Tutorial;
  }[] = null;

  tutorGroups: {
    label: string;
    options: {id: string | number; inboxDescription: string | undefined}[];
  }[] = [];

  tasks: Task[] = null;

  // hasJplagReport: boolean = false;

  watchingTaskKey: boolean;

  panelOpenState = false;
  loading = true;
  skeletonRows = Array.from({length: 12}, (_, index) => index);

  definedTasksPipe = new TasksOfTaskDefinitionPipe();
  tasksInTutorialsPipe = new TasksInTutorialsPipe();
  taskWithStudentNamePipe = new TasksForInboxSearchPipe();
  tasksByTutorPipe = new TasksByTutorPipe();
  // Let's call having a source of tasksForDefinition plus having a task definition
  // auto-selected with the search options open task def mode -- i.e., the mode
  // for selecting tasks by task definitions

  allowHover = true;

  viewPreferences: StaffTaskListViewPreferences = this.defaultViewPreferences();

  sortOptions: StaffTaskListSortOptionView[] = [
    {value: 'default', label: 'Default order', icon: 'sort'},
    {
      value: 'feedbackDeadline',
      label: 'Feedback deadline',
      icon: 'event_busy',
      directions: {asc: 'Soonest first', desc: 'Latest first'},
    },
  ];

  filterOptions: StaffTaskListFilterOptionView[] = [
    {
      key: 'awaitingFeedback',
      label: 'Waiting too long for feedback',
      tooltip: 'Submissions past this unit’s feedback warning threshold',
    },
    {
      key: 'similaritiesDetected',
      label: 'Similarities detected',
      tooltip: 'Tasks flagged by similarity detection',
    },
  ];

  statusOptions: StaffTaskListStatusOptionView[] = [];

  filtersExpanded = false;

  // Track if all tasks have already been fetched
  // Avoids redundant API calls when changing tutorial filters
  fetchedAllTasks: boolean = false;

  constructor(
    private selectedTaskService: SelectedTaskService,
    private alertService: AlertService,
    private fileDownloaderService: FileDownloaderService,
    public dialog: MatDialog,
    private csvUploadModal: CsvUploadModalService,
    private csvResultModal: CsvResultModalService,
    private userService: UserService,
    private hotkeys: HotkeysService,
    private router: Router,
    private route: ActivatedRoute,
    private taskDefinitionService: TaskDefinitionService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskData && !changes.taskData.isFirstChange() && this.tasks?.length) {
      this.setTaskDefFromTaskKey(this.taskData.taskKey);
      this.syncSelectedTaskFromTaskKey();
    }

    const unitChanged =
      !!changes.unit &&
      !changes.unit.isFirstChange() &&
      changes.unit.currentValue?.id &&
      changes.unit.previousValue?.id !== changes.unit.currentValue?.id;

    if (unitChanged && this.filters) {
      this.initializeUnitData();
    }
  }

  ngOnDestroy(): void {
    this.taskLoadSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.hotkeys.removeShortcuts('control.shift.arrowdown');
    this.hotkeys.removeShortcuts('control.shift.arrowup');
  }

  ngOnInit(): void {
    const registeredHotkeys = this.hotkeys.getHotkeys().map((hotkey) => hotkey.keys);

    if (!registeredHotkeys.includes('control.shift.arrowdown')) {
      this.hotkeys
        .addShortcut({
          keys: 'control.shift.arrowdown',
          description: 'Select next task',
        })
        .subscribe(() => this.nextTask());
    }

    if (!registeredHotkeys.includes('control.shift.arrowup')) {
      this.hotkeys
        .addShortcut({
          keys: 'control.shift.arrowup',
          description: 'Select previous task',
        })
        .subscribe(() => this.previousTask());
    }

    // if device is movile always set hover to false
    // so you can instantly click on an item in the list
    if (navigator.maxTouchPoints > 1) {
      this.allowHover = false;
    }

    this.initializeUnitData();
  }

  private initializeUnitData(): void {
    this.tasks = null;
    this.filteredTasks = null;
    this.fetchedAllTasks = false;
    this.viewPreferences = this.defaultViewPreferences();

    // Does the current user have any tutorials?
    this.userHasTutorials =
      this.unit.tutorialsForUserName(this.userService.currentUser.name)?.length > 0;

    const staff = this.unit.staff.slice();

    const byName = (a: UnitRole, b: UnitRole) =>
      (a.user?.name ?? '').localeCompare(b.user?.name ?? '');

    const mentored = staff
      .filter((ur) => ur.mentorId === this.unitRole.id)
      .slice()
      .sort(byName);

    const allTutors = staff.slice().sort(byName);
    const shouldDefaultToMyStudents =
      (this.unitRole.role === 'Tutor' || this.unitRole.role === 'Convenor') &&
      this.userHasTutorials;

    this.filters = Object.assign(
      {
        studentName: null,
        tutorialIdSelected: shouldDefaultToMyStudents ? 'mine' : 'all',
        tutorials: [],
        unitRoleIdSelected:
          mentored.length > 0 && this.viewType === 'moderation' ? 'mentoring_all' : 'all',
        taskDefinitionIdSelected: null,
        taskDefinition: null,
        forceStream: true,
      },
      this.filters,
    );

    // mat-select skips options with a null value, so the "all" entry needs a real one to match
    this.filters.taskDefinitionIdSelected ??= ALL_TASK_DEFINITIONS;

    this.studentFilter = [
      ...[
        {id: 'all', inboxDescription: 'All Students', abbreviation: '__all', forceStream: false},
        {
          id: 'mine',
          inboxDescription: 'My Students',
          abbreviation: '__mine',
          forceStream: !this.isTaskDefMode,
        },
      ],
      ...this.unit.tutorials.map((t) => {
        return {
          id: t.id,
          inboxDescription: `${t.abbreviation} - ${t.description}`,
          abbreviation: t.abbreviation,
          forceStream: true,
          tutorial: t,
        };
      }),
    ];
    this.tutorGroups = [
      ...(mentored.length > 0
        ? [
            {
              label: 'My Tutors (Mentoring)',
              options: [
                {id: 'mentoring_all', inboxDescription: 'Show All Mine'},
                ...mentored.map((ur) => ({
                  id: ur.id,
                  inboxDescription: ur.user?.name,
                })),
              ],
            },
          ]
        : []),
      {
        label: 'All Tutors',
        options: [
          {id: 'all', inboxDescription: 'Show All'},
          ...allTutors.map((ur) => ({
            id: ur.id,
            inboxDescription: ur.user?.name,
          })),
        ],
      },
    ];

    this.tutorialIdChanged(false);

    this.setTaskDefFromTaskKey(this.taskData.taskKey);

    // Initially not watching the task key
    this.watchingTaskKey = false;

    this.refreshData();
  }

  public get isTaskDefMode(): boolean {
    return this.taskData.taskDefMode;
  }

  private get selectedTaskDefinitionId(): TaskDefinition | number | undefined {
    const selected = this.filters?.taskDefinitionIdSelected;
    return selected === ALL_TASK_DEFINITIONS ? undefined : selected;
  }

  downloadSubmissionPdfs() {
    const taskDef = this.filters.taskDefinition;
    this.taskDefinitionService.zipSubmissionPdfs(taskDef).subscribe({
      next: (newJob) => {
        this.sidekiqProgressModalService
          .show(`Downloading submission pdfs for ${taskDef.abbreviation}`, newJob.id)
          .subscribe({
            next: (_job) => {
              this.fileDownloaderService.downloadNativeFile(
                `${AppInjector.get(DoubtfireConstants).API_URL}/submission/unit/${
                  this.unit.id
                }/task_definitions/${taskDef.id}/student_pdfs`,
              );
            },
          });
      },
      error: (error) => {
        this.alertService.error(error, 6000);
      },
    });
  }

  downloadSubmissionFiles() {
    const taskDef = this.filters.taskDefinition;
    this.taskDefinitionService.zipSubmissionFiles(taskDef).subscribe({
      next: (newJob) => {
        this.sidekiqProgressModalService
          .show(`Downloading submission files for ${taskDef.abbreviation}`, newJob.id)
          .subscribe({
            next: (_job) => {
              this.fileDownloaderService.downloadNativeFile(
                `${AppInjector.get(DoubtfireConstants).API_URL}/submission/unit/${
                  this.unit.id
                }/task_definitions/${taskDef.id}/download_submissions`,
              );
            },
          });
      },
      error: (error) => {
        this.alertService.error(error, 6000);
      },
    });
  }

  openBatchFeedbackDialog() {
    const taskDefinition = this.filters.taskDefinition ?? undefined;

    if (!taskDefinition) {
      this.alertService.error('Select a task definition before uploading batch feedback.', 5000);
      return;
    }

    const dialogRef = this.dialog.open(BatchFeedbackWorkflowDialogComponent, {
      width: '100%',
      maxWidth: '840px',
      data: {
        unit: this.unit,
        taskDefinition,
        myStudentsOnly: this.filters.tutorialIdSelected === 'mine',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.openUpload) {
        return;
      }

      this.csvUploadModal.show(
        `Upload ${taskDefinition.abbreviation} Batch Feedback Zip`,
        '',
        {
          file: {name: 'Batch Feedback Zip', type: 'zip'},
        },
        this.unit.getBatchFeedbackUploadUrl(taskDefinition),
        (response: SidekiqJob) => {
          if (!response?.id) {
            this.alertService.error('Batch feedback upload failed.', 6000);
            return;
          }

          this.sidekiqProgressModalService
            .show(`Uploading ${taskDefinition.abbreviation} Batch Feedback`, response.id)
            .subscribe({
              next: (job) => {
                this.csvResultModal.show('Batch Feedback Upload Results', JSON.parse(job.result));
                this.refreshData();
              },
              error: (error) => {
                console.error(error);
                this.alertService.error('Batch feedback upload failed.', 6000);
              },
            });
        },
      );
    });
  }

  downloadJPLAGReport() {
    const taskDef = this.filters.taskDefinition;
    this.fileDownloaderService.downloadFile(
      taskDef.getJplagReportUrl(),
      `${this.unit.code}-${taskDef.abbreviation}-jplag-report.zip`,
    );

    const url = this.router.serializeUrl(this.router.createUrlTree(['/jplag-report-viewer']));
    window.open(url, '_blank');
  }

  openDialog() {
    const dialogRef = this.dialog.open(this.searchDialog);

    dialogRef.afterClosed().subscribe();
  }

  refreshTasks(): void {
    this.refreshData();
  }

  applyFilters() {
    let filteredTasks = this.definedTasksPipe.transform(this.tasks, this.filters.taskDefinition);
    if (this.filters.tutorials) {
      filteredTasks = this.tasksInTutorialsPipe.transform(
        filteredTasks,
        this.filters.tutorials.map((t) => t.id),
        this.filters.forceStream,
      );
    }

    if (this.filters.unitRoleIdSelected) {
      filteredTasks = this.tasksByTutorPipe.transform(
        this.unitRole,
        filteredTasks,
        this.filters.unitRoleIdSelected,
      );
    }

    filteredTasks = this.taskWithStudentNamePipe.transform(filteredTasks, this.filters.studentName);

    // Status counts are taken before the status filter, so the menu keeps listing
    // the statuses you could switch to.
    const beforeStatusFilter = filteredTasks?.filter((task) => this.matchesQuickFilters(task));
    this.statusOptions = this.buildStatusOptions(beforeStatusFilter);

    filteredTasks = this.sortTasks(
      beforeStatusFilter?.filter((task) => this.matchesStatusFilter(task)),
    );
    this.filteredTasks = filteredTasks;

    // Clear selected task only when the active filters hide it.
    if (
      this.taskData.selectedTask &&
      !filteredTasks?.some((task) => task?.hasTaskKey(this.taskData.selectedTask.taskKey()))
    ) {
      this.setSelectedTask(null);
    }
  }

  openTaskDefs() {
    // Automatically "open" the task definition select element if in task def mode
    const selectEl = document.querySelector<HTMLSelectElement>(
      'select[ng-model="filters.taskDefinitionIdSelected"]',
    );
    if (!selectEl) {
      return;
    }
    selectEl.size = 10;
    selectEl.focus();
  }

  unitRoleIdChanged(attemptRefreshData: boolean = true): void {
    this.applyFilters();

    const isExplorerView = this.isTaskDefMode;
    if (attemptRefreshData && !this.fetchedAllTasks && !isExplorerView) {
      this.refreshData();
    }
  }

  tutorialIdChanged(
    attemptRefreshData: boolean = true,
    selectedTutorialId: string | number = this.filters.tutorialIdSelected,
  ): void {
    this.filters.tutorialIdSelected = selectedTutorialId;
    const tutorialId = selectedTutorialId;

    if (attemptRefreshData) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {students: tutorialId},
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }

    const filterOption = this.studentFilter.find((f) => String(f.id) === String(tutorialId));

    if (!filterOption) {
      return;
    }

    this.filters.forceStream = filterOption.forceStream;

    if (tutorialId === 'mine') {
      this.filters.tutorials = this.unit.tutorialsForUserName(this.userService.currentUser.name);
      this.filters.unitRoleIdSelected = 'all';
    } else if (tutorialId === 'all') {
      // Ignore tutorials filter
      this.filters.tutorials = null;
    } else {
      this.filters.tutorials = [filterOption.tutorial];
      this.filters.unitRoleIdSelected = 'all';
    }

    this.applyFilters();

    const isExplorerView = this.isTaskDefMode;
    if (attemptRefreshData && !this.fetchedAllTasks && !isExplorerView) {
      this.refreshData();
    }
  }

  //  Task definition options
  taskDefinitionIdChanged() {
    let taskDef;
    const taskDefId = this.filters.taskDefinitionIdSelected;
    if (taskDefId) {
      taskDef = taskDefId instanceof TaskDefinition ? taskDefId : this.unit.taskDef(taskDefId);
    } else {
      taskDef = null;
    }
    this.filters.taskDefinition = taskDef;
    if (this.isTaskDefMode) {
      this.refreshData();
    }
    this.applyFilters();
  }

  private setTaskDefFromTaskKey(taskKey) {
    // Only applicable in taskDefMode
    if (!this.isTaskDefMode) {
      return;
    }
    const taskDef =
      this.unit.taskDefinitionCache.currentValues.find(
        (x) => x.abbreviation === taskKey?.taskDefAbbr,
      ) || this.unit.taskDefinitionCache.currentValues[0];
    this.filters.taskDefinitionIdSelected = taskDef.id;
    this.filters.taskDefinition = taskDef;
  }

  // Finds a task (or null) given its task key
  private findTaskForTaskKey(key): Task {
    return this.tasks.find((t) => t?.hasTaskKey(key));
  }

  private syncSelectedTaskFromTaskKey(): void {
    if (!this.tasks?.length) {
      return;
    }

    if (!this.taskData.taskKey) {
      this.setSelectedTask(null);
      return;
    }

    const task = this.findTaskForTaskKey(this.taskData.taskKey);
    if (task) {
      this.setSelectedTask(task);
    }
  }

  // Callback to refresh data from the task source
  private refreshData() {
    const fetchMyStudentsOnly = this.filters.tutorialIdSelected === 'mine';
    const requestedTaskKey = this.taskData.taskKey as {
      studentId: string | number;
      taskDefAbbr: string;
    } | null;

    this.loading = true;
    this.taskLoadSubscription?.unsubscribe();
    // Tasks for feedback or tasks for task, depending on the data source
    this.taskLoadSubscription = this.taskData
      .source(this.unit, this.selectedTaskDefinitionId, fetchMyStudentsOnly)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tasks = response;
          this.applyFilters();
          this.loading = false;

          this.fetchedAllTasks = !fetchMyStudentsOnly && !this.isTaskDefMode;

          if (
            this.viewType === 'inbox' &&
            requestedTaskKey &&
            !this.filteredTasks?.some((task) => task?.hasTaskKey(requestedTaskKey))
          ) {
            void this.router.navigate(['/units', this.unit.id, 'tasks', 'definition'], {
              queryParams: {
                students: 'all',
                studentId: requestedTaskKey.studentId,
                taskDefAbbr: requestedTaskKey.taskDefAbbr,
              },
              replaceUrl: true,
            });
            return;
          }

          // If the URL carries a task key, load that task once the query results arrive.
          this.syncSelectedTaskFromTaskKey();

          // For when URL has been manually changed, set the selected task
          // using new array of tasks loaded from the new taskKey
          if (!this.watchingTaskKey) {
            this.watchingTaskKey = true;
          }
        },
        error: (message) => {
          this.alertService.error(message, 6000);
          this.loading = false;
        },
      });
  }

  setSelectedTask(task: Task) {
    this.selectedTaskService.setSelectedTask(task);
    this.taskData.selectedTask = task;
    if (this.taskData.onSelectedTaskChange) {
      this.taskData.onSelectedTaskChange(task);
    }
    if (task) {
      this.scrollToTaskInList(task);
    }
  }

  private scrollToTaskInList(task: Task) {
    const taskEl = document.querySelector(`#${task.taskKeyToIdString()}`) as
      | (HTMLElement & {
          scrollIntoViewIfNeeded?: (options?: ScrollIntoViewOptions) => void;
        })
      | null;
    if (!taskEl) {
      return;
    }
    if (taskEl.scrollIntoViewIfNeeded) {
      taskEl.scrollIntoViewIfNeeded({behavior: 'smooth'});
    } else {
      taskEl.scrollIntoView({behavior: 'smooth'});
    }
  }

  isSelectedTask(task: Task) {
    const sameProject = this.taskData.selectedTask?.project.id === task.project.id;
    const sameTaskDef = this.taskData.selectedTask?.definition.id === task.definition.id;
    return sameProject && sameTaskDef;
  }

  nextTask(): void {
    if (!this.filteredTasks) {
      return;
    }
    const currentTaskIndex = this.filteredTasks.findIndex((task) => this.isSelectedTask(task));
    if (currentTaskIndex >= this.filteredTasks.length) {
      return;
    }
    const newTask = this.filteredTasks[currentTaskIndex + 1];
    if (newTask) {
      this.setSelectedTask(newTask);
    }
  }

  previousTask(): void {
    const currentTaskIndex = this.filteredTasks.findIndex((task) => this.isSelectedTask(task));
    if (currentTaskIndex === 0) {
      return;
    }
    const newTask = this.filteredTasks[currentTaskIndex - 1];
    if (newTask) {
      this.setSelectedTask(newTask);
    }
  }

  togglePin(task: Task) {
    if (task.id === undefined) {
      // Can't pin a task that doesn't actually exist yet
      this.alertService.error(`This task can't be pinned yet`, 3000);
      return;
    }
    const refreshOrdering = () => this.applyFilters();
    if (task.pinned) {
      task.unpin(refreshOrdering);
    } else {
      task.pin(refreshOrdering);
    }
  }

  getWarningIcon(task: Task): 'warning' | 'overflow' | null {
    if (!task.submissionDate) {
      return null;
    }
    if (task.status !== 'ready_for_feedback') {
      return null;
    }

    const daysSinceSubmission = task.daysSinceSubmission();

    if (daysSinceSubmission >= task.unit.feedbackOverflowThresholdDays) {
      return 'overflow';
    }

    if (daysSinceSubmission >= task.unit.feedbackWarningThresholdDays) {
      return 'warning';
    }

    return null;
  }

  public setSortBy(sortBy: StaffTaskListSortOption): void {
    const sortDirection =
      sortBy === 'default' && !this.defaultSortForView
        ? DEFAULT_VIEW_PREFERENCES.sortDirection
        : this.viewPreferences.sortBy === sortBy
          ? this.toggledSortDirection
          : 'asc';

    this.viewPreferences = {...this.viewPreferences, sortBy, sortDirection};
    this.viewPreferencesChanged();
  }

  public sortLabelFor(option: StaffTaskListSortOptionView): string {
    if (option.value !== 'default') {
      return option.label;
    }

    return this.defaultSortForView?.label ?? option.label;
  }

  public isSortSelected(option: StaffTaskListSortOptionView): boolean {
    return this.viewPreferences.sortBy === option.value;
  }

  public sortDirectionLabelFor(option: StaffTaskListSortOptionView): string {
    if (!this.isSortSelected(option)) {
      return '';
    }

    const directions =
      option.value === 'default' ? this.defaultSortForView?.directions : option.directions;

    return directions?.[this.viewPreferences.sortDirection] ?? '';
  }

  private get defaultSortForView(): typeof WAITING_TIME_DEFAULT | undefined {
    return DEFAULT_SORT_BY_VIEW[this.viewType];
  }

  public isFilterActive(key: StaffTaskListFilterKey): boolean {
    return this.viewPreferences.filters[key];
  }

  public toggleFilter(key: StaffTaskListFilterKey, value: boolean): void {
    this.viewPreferences = {
      ...this.viewPreferences,
      filters: {...this.viewPreferences.filters, [key]: value},
    };
    this.viewPreferencesChanged();
  }

  public isStatusSelected(status: TaskStatusEnum): boolean {
    return this.viewPreferences.statuses.includes(status);
  }

  public toggleStatus(status: TaskStatusEnum): void {
    const statuses = this.isStatusSelected(status)
      ? this.viewPreferences.statuses.filter((selected) => selected !== status)
      : [...this.viewPreferences.statuses, status];

    this.viewPreferences = {...this.viewPreferences, statuses};
    this.viewPreferencesChanged();
  }

  public clearStatusFilter(): void {
    this.viewPreferences = {...this.viewPreferences, statuses: []};
    this.viewPreferencesChanged();
  }

  public resetViewPreferences(): void {
    this.viewPreferences = this.defaultViewPreferences();
    this.viewPreferencesChanged();
  }

  // A lone status is not worth a filter row -- everything in the list already has it
  public get showStatusFilter(): boolean {
    return this.statusOptions.length > 1 || this.viewPreferences.statuses.length > 0;
  }

  public get activeFilterCount(): number {
    return Object.values(this.viewPreferences.filters).filter(Boolean).length;
  }

  public get activeViewPreferenceCount(): number {
    // Reversing the default sort keeps sortBy on 'default', so check the direction too
    const sortChanged =
      this.viewPreferences.sortBy !== DEFAULT_VIEW_PREFERENCES.sortBy ||
      this.viewPreferences.sortDirection !== DEFAULT_VIEW_PREFERENCES.sortDirection;

    return (
      (sortChanged ? 1 : 0) +
      this.activeFilterCount +
      (this.viewPreferences.statuses.length > 0 ? 1 : 0)
    );
  }

  public get hasModifiedViewPreferences(): boolean {
    return this.activeViewPreferenceCount > 0;
  }

  private get hasActiveFilters(): boolean {
    return this.activeFilterCount > 0 || this.viewPreferences.statuses.length > 0;
  }

  private viewPreferencesChanged(): void {
    this.applyFilters();
  }

  private matchesQuickFilters(task: Task): boolean {
    if (!task) {
      // Keep placeholder entries while nothing is being filtered out
      return !this.hasActiveFilters;
    }

    const filters = this.viewPreferences.filters;

    if (filters.awaitingFeedback && !this.getWarningIcon(task)) {
      return false;
    }

    return !(filters.similaritiesDetected && !task.similaritiesDetected);
  }

  private matchesStatusFilter(task: Task): boolean {
    if (this.viewPreferences.statuses.length === 0) {
      return true;
    }

    return !!task?.status && this.viewPreferences.statuses.includes(task.status);
  }

  private buildStatusOptions(tasks: Task[]): StaffTaskListStatusOptionView[] {
    const counts: Map<TaskStatusEnum, number> = new Map();

    // Selected statuses stay listed even once nothing matches them
    this.viewPreferences.statuses.forEach((status) => counts.set(status, 0));

    tasks?.forEach((task) => {
      if (task?.status) {
        counts.set(task.status, (counts.get(task.status) ?? 0) + 1);
      }
    });

    return [...counts.entries()]
      .sort(([a], [b]) => (TaskStatus.STATUS_SEQ.get(a) ?? 0) - (TaskStatus.STATUS_SEQ.get(b) ?? 0))
      .map(([status, count]) => ({
        status,
        count,
        label: TaskStatus.STATUS_LABELS.get(status) ?? status,
        color: TaskStatus.STATUS_COLORS.get(status) ?? '#cccccc',
      }));
  }

  // The inbox ranks comment-only tasks by their oldest unread comment, so prefer
  // that date over the raw submission date when the API provides it
  private waitingSinceFor(task: Task): Date {
    return task?.waitingSince ?? task?.submissionDate;
  }

  private feedbackDeadlineFor(task: Task): Date | null {
    // localDeadlineDate() needs the definition's deadline to be set
    if (!task?.definition?.dueDate) {
      return null;
    }

    const deadline = task.localDeadlineDate();
    return Number.isFinite(deadline?.getTime()) ? deadline : null;
  }

  private sortTasks(tasks: Task[]): Task[] {
    if (!tasks?.length) {
      return tasks;
    }

    return [...tasks].sort((a, b) => {
      const pinned = Number(b?.pinned) - Number(a?.pinned);
      if (pinned !== 0) {
        return pinned;
      }

      return this.compareTasks(a, b);
    });
  }

  private compareTasks(a: Task, b: Task): number {
    let result: number;

    switch (this.viewPreferences.sortBy) {
      case 'feedbackDeadline':
        result = this.compareDates(this.feedbackDeadlineFor(a), this.feedbackDeadlineFor(b));
        break;
      default:
        if (!this.defaultSortForView) {
          // Nothing to order by -- keep the order the tasks arrived in
          return 0;
        }

        result = this.compareDates(this.waitingSinceFor(a), this.waitingSinceFor(b));
    }

    return this.viewPreferences.sortDirection === 'asc' ? result : result * -1;
  }

  private compareDates(a: Date, b: Date): number {
    return this.dateTime(a) - this.dateTime(b);
  }

  private dateTime(date: Date): number {
    const time = date ? new Date(date).getTime() : NaN;
    return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
  }

  private get toggledSortDirection(): StaffTaskListSortDirection {
    return this.viewPreferences.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  private defaultViewPreferences(): StaffTaskListViewPreferences {
    return {
      ...DEFAULT_VIEW_PREFERENCES,
      filters: {...DEFAULT_VIEW_PREFERENCES.filters},
      statuses: [],
    };
  }
}
