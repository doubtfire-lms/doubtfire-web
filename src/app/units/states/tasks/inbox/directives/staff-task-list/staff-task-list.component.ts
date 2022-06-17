/* eslint-disable no-shadow, @typescript-eslint/no-shadow */

import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
  HostListener,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { taskDefinition, groupService, alertService } from 'src/app/ajs-upgraded-providers';
import { TasksOfTaskDefinitionPipe } from 'src/app/common/filters/tasks-of-task-definition.pipe';
import { TasksInTutorialsPipe } from 'src/app/common/filters/tasks-in-tutorials.pipe';
import { TasksForInboxSearchPipe } from 'src/app/common/filters/tasks-for-inbox-search.pipe';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { Tutorial, UserService, Task, Project } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'df-staff-task-list',
  templateUrl: './staff-task-list.component.html',
  styleUrls: ['./staff-task-list.component.scss'],
})
export class StaffTaskListComponent implements OnInit, OnChanges {
  @ViewChild('searchDialog') searchDialog: TemplateRef<any>;

  @Input() task: Task;
  @Input() project: Project;

  @Input() taskData;
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() filters;
  @Input() showSearchOptions = false;

  isNarrow: boolean;

  userHasTutorials: boolean;
  filteredTasks: any[] = null;
  studentFilter: any[] = null;
  tasks: any[] = null;

  watchingTaskKey: any;

  panelOpenState = false;
  loading = true;

  definedTasksPipe = new TasksOfTaskDefinitionPipe();
  tasksInTutorialsPipe = new TasksInTutorialsPipe();
  taskWithStudentNamePipe = new TasksForInboxSearchPipe();
  // Let's call having a source of tasksForDefinition plus having a task definition
  // auto-selected with the search options open task def mode -- i.e., the mode
  // for selecting tasks by task definitions

  states = [
    { sort: 'default', icon: 'horizontal_rule' },
    { sort: 'ascending', icon: 'arrow_upward' },
    { sort: 'descending', icon: 'arrow_downward' },
  ];

  taskDefSort = 0;
  tutorialSort = 0;
  originalFilteredTasks: any[] = null;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.metaKey) {
      switch (event.key) {
        case 'ArrowDown':
          this.nextTask();
          break;
        case 'ArrowUp':
          this.previousTask();
          break;
        default:
          break;
      }
    }
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    @Inject(taskDefinition) private taskDef,
    @Inject(groupService) private groupService,
    @Inject(alertService) private alertService,
    public dialog: MatDialog,
    private userService: UserService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.unit.currentValue.id && changes.unit.previousValue.id !== changes.unit.currentValue.id) ||
      this.tasks == null
    ) {
      this.refreshData();
    }
  }

  ngOnInit(): void {
    const layoutChanges = this.breakpointObserver.observe('(max-width: 1000px)');

    layoutChanges.subscribe((state: BreakpointState) => {
      this.isNarrow = state.matches;
    });
    // Does the current user have any tutorials?
    this.userHasTutorials = this.unit.tutorialsForUserName(this.userService.currentUser.name)?.length > 0;

    this.filters = Object.assign(
      {
        studentName: null,
        tutorialIdSelected: (this.unitRole.role === 'Tutor' || 'Convenor') && this.userHasTutorials ? 'mine' : 'all',
        tutorials: [],
        taskDefinitionIdSelected: null,
        taskDefinition: null,
        forceStream: true
      },
      this.filters
    );

    this.studentFilter = [
      ...[
        { id: 'all', inboxDescription: 'All Students', abbreviation: '__all', forceStream: false },
        { id: 'mine', inboxDescription: 'My Students', abbreviation: '__mine', forceStream: !this.isTaskDefMode },
      ],
      ...this.unit.tutorials.map((t) => {
        return {
          id: t.id,
          inboxDescription: `${t.abbreviation} - ${t.description}`,
          abbreviation: t.abbreviation,
          forceStream: true
        };
      }),
    ];

    this.tutorialIdChanged();

    this.setTaskDefFromTaskKey(this.taskData.taskKey);

    // Initially not watching the task key
    this.watchingTaskKey = false;
  }

  public get isTaskDefMode(): boolean {
    console.log("implement isTaskDefMode");
    return false;
    // return this.taskData?.source === this.Unit.tasksForDefinition &&
    // this.filters?.taskDefinitionIdSelected &&
    // this.showSearchOptions;
  }

  downloadSubmissionPdfs() {
    this.taskDef.downloadSubmissionsPdfs(this.unit, this.filters.taskDefinition);
  }

  downloadSubmissions() {
    this.taskDef.downloadSubmissions(this.unit, this.filters.taskDefinition);
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
      filteredTasks = this.tasksInTutorialsPipe.transform(filteredTasks, this.filters.tutorials, this.filters.forceStream);
    }
    filteredTasks = this.taskWithStudentNamePipe.transform(filteredTasks, this.filters.studentName);
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
    const selectEl: any = document.querySelector('select[ng-model="filters.taskDefinitionIdSelected"]') as any;
    selectEl.size = 10;
    selectEl.focus();
  }

  tutorialIdChanged(): void {
    const tutorialId = this.filters.tutorialIdSelected;

    const filterOption = this.studentFilter.find((f) => f.id === tutorialId);

    this.filters.forceStream = filterOption.forceStream;

    if (tutorialId === 'mine') {
      this.filters.tutorials = this.unit.tutorialsForUserName(this.userService.currentUser.name);
    } else if (tutorialId === 'all') {
      // Ignore tutorials filter
      this.filters.tutorials = null;
    } else {
      this.filters.tutorials = [filterOption];
    }

    if (this.filters.tutorials) {
      this.filters.tutorials = this.filters.tutorials.map((t) => t.id);
    }
    this.applyFilters();
  }

  //  Task definition options
  groupSetName(id: number) {
    if (this.unit.hasGroupwork) {
      this.groupService.groupSetName(id, this.unit);
    }
  }

  taskDefinitionIdChanged() {
    let taskDef;
    const taskDefId = this.filters.taskDefinitionIdSelected;
    if (taskDefId) {
      taskDef = this.unit.taskDef(taskDefId);
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
      this.unit.taskDefinitionCache.currentValues.find((x) => x.abbreviation === taskKey?.taskDefAbbr) || this.unit.taskDefinitionCache.currentValues[0];
    this.filters.taskDefinitionIdSelected = taskDef.id;
    this.filters.taskDefinition = taskDef;
  }

  // Finds a task (or null) given its task key
  private findTaskForTaskKey(key) {
    this.tasks.find((t) => t?.hasTaskKey(key));
  }

  // Callback to refresh data from the task source
  private refreshData() {
    this.loading = true;
    // Tasks for feedback or tasks for task, depending on the data source
    this.taskData.source.query(
      { id: this.unit.id, task_def_id: this.filters?.taskDefinitionIdSelected },
      (response) => {
        this.tasks = this.unit.incorporateTasks(response, this.applyFilters.bind(this));
        // If loading via task definitions, fill
        if (this.isTaskDefMode) {
          // Filter out any empty tasks
          // TODO: need to investigate how these are getting here.
          this.tasks = this.tasks.filter((n) => n);
          const unstartedTasks = this.unit.fillWithUnStartedTasks(this.tasks, this.filters.taskDefinitionIdSelected);
          Object.assign(this.tasks, unstartedTasks);
        }
        // Apply initial filters
        this.applyFilters();
        this.loading = false;
        // Load initial set task, either the one provided (by the URL)
        // then load actual task in now or the first task that applies
        // to the given set of filters.
        const task = this.findTaskForTaskKey(this.taskData.taskKey);
        this.setSelectedTask(task);
        // For when URL has been manually changed, set the selected task
        // using new array of tasks loaded from the new taskKey
        if (!this.watchingTaskKey) {
          this.watchingTaskKey = true;
        }
      },
      (error) => {
        this.alertService.add('danger', error.data.error, 6000);
      }
    );
  }

  setSelectedTask(task) {
    this.taskData.selectedTask = task;
    if (typeof this.taskData.onSelectedTaskChange === 'function') {
      this.taskData.onSelectedTaskChange(task);
    }
    if (task) {
      this.scrollToTaskInList(task);
    }
  }

  private scrollToTaskInList(task) {
    const taskEl = document.querySelector(`staff-task-list #${task.taskKeyToIdString()}`) as any;
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
    taskEl[funcName]({ behavior: 'smooth', block: 'top' });
  }

  isSelectedTask(task: Task) {
    const sameProject = this.taskData.selectedTask?.project.id === task.project.id;
    const sameTaskDef = this.taskData.selectedTask?.definition.id === task.definition.id;
    return sameProject && sameTaskDef;
  }

  nextTask(): void {
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
      this.filteredTasks = [...this.filteredTasks.sort((a, b) => a.definition.seq - b.definition.seq)];
    } else if (this.states[this.taskDefSort].sort == 'descending') {
      this.filteredTasks = [...this.filteredTasks.sort((a, b) => b.definition.seq - a.definition.seq)];
    } else {
      this.filteredTasks = [...this.originalFilteredTasks];
    }
  }

  // toggleTutorialSort() {
  // }

  togglePin(task) {
    if (task.pinned) {
      task.unpin(
        task.id,
        (sucess: any) => {},
        (error: any) => {
          this.alertService.add('danger', error.data.error, 6000);
        }
      );
    } else {
      task.pin(
        task.id,
        (sucess: any) => {},
        (error: any) => {
          this.alertService.add('danger', error.data.error, 6000);
        }
      );
    }
  }
}
