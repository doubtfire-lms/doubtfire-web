/* eslint-disable no-shadow, @typescript-eslint/no-shadow */

import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener,
  ViewChild,
  TemplateRef,
  OnDestroy,
  Inject,
} from '@angular/core';
import {TasksOfTaskDefinitionPipe} from 'src/app/common/filters/tasks-of-task-definition.pipe';
import {TasksInTutorialsPipe} from 'src/app/common/filters/tasks-in-tutorials.pipe';
import {TasksForInboxSearchPipe} from 'src/app/common/filters/tasks-for-inbox-search.pipe';
import {MatDialog} from '@angular/material/dialog';
import {csvResultModalService, csvUploadModalService} from 'src/app/ajs-upgraded-providers';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {
  Tutorial,
  UserService,
  Task,
  Project,
  TaskDefinition,
} from 'src/app/api/models/doubtfire-model';
import {Observable} from 'rxjs';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AppInjector} from 'src/app/app-injector';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {HotkeysService} from '@ngneat/hotkeys';
import {Router} from '@angular/router';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {TasksByTutorPipe} from 'src/app/common/filters/tasks-by-tutor.pipe';
import {BatchFeedbackWorkflowDialogComponent} from './batch-feedback-workflow-dialog/batch-feedback-workflow-dialog.component';

@Component({
  selector: 'df-staff-task-list',
  templateUrl: './staff-task-list.component.html',
  styleUrls: ['./staff-task-list.component.scss'],
})
export class StaffTaskListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('searchDialog') searchDialog: TemplateRef<any>;

  @Input() task: Task;
  @Input() project: Project;

  @Input() taskData: {
    source: (
      unit: Unit,
      taskDef: TaskDefinition | number,
      fetchMyStudentsOnly?: boolean,
    ) => Observable<Task[]>;
    selectedTask: Task;
    taskKey: string;
    onSelectedTaskChange: (task: Task) => void;
    taskDefMode: boolean;
  };
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() filters: Partial<{
    taskDefinition: TaskDefinition;
    tutorials: Tutorial[];
    forceStream: boolean;
    studentName: string;
    tutorialIdSelected: any;
    unitRoleIdSelected: number | string;
    taskDefinitionIdSelected: number | TaskDefinition;
  }>;
  @Input() showSearchOptions = true;

  @Input() isNarrow: boolean;

  @Input() viewType: 'inbox' | 'explorer' | 'moderation' | 'overflow';

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

  watchingTaskKey: any;

  panelOpenState = false;
  loading = true;

  definedTasksPipe = new TasksOfTaskDefinitionPipe();
  tasksInTutorialsPipe = new TasksInTutorialsPipe();
  taskWithStudentNamePipe = new TasksForInboxSearchPipe();
  tasksByTutorPipe = new TasksByTutorPipe();
  // Let's call having a source of tasksForDefinition plus having a task definition
  // auto-selected with the search options open task def mode -- i.e., the mode
  // for selecting tasks by task definitions

  states = [
    {sort: 'default', icon: 'horizontal_rule'},
    {sort: 'ascending', icon: 'arrow_upward'},
    {sort: 'descending', icon: 'arrow_downward'},
  ];

  taskDefSort = 0;
  tutorialSort = 0;
  originalFilteredTasks: any[] = null;
  allowHover = true;

  // Track if all tasks have already been fetched
  // Avoids redundant API calls when changing tutorial filters
  fetchedAllTasks: boolean = false;

  constructor(
    private selectedTaskService: SelectedTaskService,
    private alertService: AlertService,
    private fileDownloaderService: FileDownloaderService,
    public dialog: MatDialog,
    @Inject(csvUploadModalService) private csvUploadModal: any,
    @Inject(csvResultModalService) private csvResultModal: any,
    private userService: UserService,
    private hotkeys: HotkeysService,
    private router: Router,
    private taskDefinitionService: TaskDefinitionService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskData && !changes.taskData.isFirstChange() && this.tasks?.length) {
      this.setTaskDefFromTaskKey(this.taskData.taskKey);
      this.syncSelectedTaskFromTaskKey();
    }

    if (!this.isTaskDefMode || !this.filters) {
      return;
    }

    const unitChanged =
      !!changes.unit &&
      !changes.unit.isFirstChange() &&
      changes.unit.currentValue?.id &&
      changes.unit.previousValue?.id !== changes.unit.currentValue?.id;

    if (unitChanged) {
      this.refreshData();
    }
  }

  ngOnDestroy(): void {
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

  downloadSubmissionPdfs() {
    const taskDef = this.filters.taskDefinition;
    this.taskDefinitionService.zipSubmissionPdfs(taskDef).subscribe({
      next: (newJob) => {
        this.sidekiqProgressModalService
          .show(`Downloading submission pdfs for ${taskDef.abbreviation}`, newJob.id)
          .subscribe({
            next: (job) => {
              this.fileDownloaderService.downloadFile(
                `${AppInjector.get(DoubtfireConstants).API_URL}/submission/unit/${
                  this.unit.id
                }/task_definitions/${taskDef.id}/student_pdfs`,
                `${this.unit.code}-${taskDef.abbreviation}-pdfs.zip`,
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
            next: (job) => {
              this.fileDownloaderService.downloadFile(
                `${AppInjector.get(DoubtfireConstants).API_URL}/submission/unit/${
                  this.unit.id
                }/task_definitions/${taskDef.id}/download_submissions`,
                `${this.unit.code}-${taskDef.abbreviation}-submissions.zip`,
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

    dialogRef.afterClosed().subscribe((result) => {});
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
    filteredTasks = this.sortPinnedTasksFirst(filteredTasks);
    this.filteredTasks = filteredTasks;

    if (this.filteredTasks != null) {
      this.originalFilteredTasks = [...this.filteredTasks];
    }

    this.taskDefSort = 0;
    this.tutorialSort = 0;

    // Fix selected task.
    if (this.taskData.selectedTask && filteredTasks?.includes(this.taskData.selectedTask)) {
      this.setSelectedTask(null);
    }
  }

  openTaskDefs() {
    // Automatically "open" the task definition select element if in task def mode
    const selectEl: any = document.querySelector(
      'select[ng-model="filters.taskDefinitionIdSelected"]',
    ) as any;
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

  tutorialIdChanged(attemptRefreshData: boolean = true): void {
    const tutorialId = this.filters.tutorialIdSelected;

    const filterOption = this.studentFilter.find((f) => f.id === tutorialId);

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

    const task = this.taskData.taskKey ? this.findTaskForTaskKey(this.taskData.taskKey) : null;
    this.setSelectedTask(task ?? null);
  }

  // Callback to refresh data from the task source
  private refreshData() {
    const fetchMyStudentsOnly = this.filters.tutorialIdSelected === 'mine';

    this.loading = true;
    // Tasks for feedback or tasks for task, depending on the data source
    this.taskData
      .source(this.unit, this.filters?.taskDefinitionIdSelected, fetchMyStudentsOnly)
      .subscribe({
        next: (response) => {
          this.tasks = response;
          this.applyFilters();
          this.loading = false;

          this.fetchedAllTasks = !fetchMyStudentsOnly && !this.isTaskDefMode;

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

  private scrollToTaskInList(task) {
    const taskEl = document.querySelector(`#${task.taskKeyToIdString()}`) as any;
    if (!taskEl) {
      return;
    }
    const funcName = taskEl.scrollIntoViewIfNeeded
      ? 'scrollIntoViewIfNeeded'
      : taskEl.scrollIntoView
        ? 'scrollIntoView'
        : '';
    if (!funcName) {
      return;
    }
    taskEl[funcName]({behavior: 'smooth'});
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

  toggleTaskDefSort() {
    this.taskDefSort = this.taskDefSort < 2 ? ++this.taskDefSort : 0;
    if (this.originalFilteredTasks == null) {
      this.originalFilteredTasks = [...this.filteredTasks];
    }
    if (this.states[this.taskDefSort].sort == 'ascending') {
      this.filteredTasks = [
        ...this.filteredTasks.sort((a, b) => a.definition.seq - b.definition.seq),
      ];
    } else if (this.states[this.taskDefSort].sort == 'descending') {
      this.filteredTasks = [
        ...this.filteredTasks.sort((a, b) => b.definition.seq - a.definition.seq),
      ];
    } else {
      this.filteredTasks = [...this.originalFilteredTasks];
    }
  }

  togglePin(task: Task) {
    if (task.id === undefined) {
      // Can't pin a task that doesn't actually exist yet
      this.alertService.error(`This task can't be pinned yet`, 3000);
      return;
    }
    const refreshOrdering = () => this.applyFilters();
    task.pinned ? task.unpin(refreshOrdering) : task.pin(refreshOrdering);
  }

  getWarningIcon(task: Task): 'warning' | 'overflow' | null {
    if (!task.submissionDate) return null;
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

  private sortPinnedTasksFirst(tasks: Task[]): Task[] {
    if (!this.isTaskDefMode || !tasks?.length) {
      return tasks;
    }

    return [...tasks].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }
}
