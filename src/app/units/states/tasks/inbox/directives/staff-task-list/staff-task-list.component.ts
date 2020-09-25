// tslint:disable: no-shadowed-variable

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
import { taskDefinition, Unit, currentUser, groupService, alertService } from 'src/app/ajs-upgraded-providers';
import { TasksOfTaskDefinitionPipe } from 'src/app/common/filters/tasks-of-task-definition.pipe';
import { TasksInTutorialsPipe } from 'src/app/common/filters/tasks-in-tutorials.pipe';
import { TasksWithStudentNamePipe } from 'src/app/common/filters/tasks-with-student-name.pipe';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'staff-task-list',
  templateUrl: './staff-task-list.component.html',
  styleUrls: ['./staff-task-list.component.scss'],
})
export class StaffTaskListComponent implements OnInit, OnChanges {
  @ViewChild('searchDialog') searchDialog: TemplateRef<any>;

  @Input() task: any;
  @Input() project: any;

  @Input() taskData;
  @Input() unit;
  @Input() unitRole;
  @Input() filters;
  @Input() showSearchOptions = false;

  isNarrow: boolean;

  submissionsPdfsUrl: string;
  submissionsUrl: string;
  userHasTutorials: boolean;
  filteredTasks: any[] = null;
  tutorials: any[] = null;
  tasks: any[] = null;

  watchingTaskKey: any;

  panelOpenState = false;
  loading = true;

  isTaskDefMode: boolean;

  definedTasksPipe = new TasksOfTaskDefinitionPipe();
  tasksInTutorialsPipe = new TasksInTutorialsPipe();
  taskWithSTudentNamePipe = new TasksWithStudentNamePipe();
  // Let's call having a source of tasksForDefinition plus having a task definition
  // auto-selected with the search options open task def mode -- i.e., the mode
  // for selecting tasks by task definitions

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
    @Inject(Unit) private Unit,

    @Inject(currentUser) private currentUser,
    @Inject(groupService) private groupService,
    @Inject(alertService) private alertService,
    public dialog: MatDialog
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
    this.userHasTutorials = this.unit.tutorialsForUserName(this.currentUser.profile.name)?.length > 0;

    this.filters = Object.assign(
      {
        studentName: null,
        tutorialIdSelected: (this.unitRole.role === 'Tutor' || 'Convenor') && this.userHasTutorials ? 'mine' : 'all',
        tutorials: [],
        taskDefinitionIdSelected: null,
        taskDefinition: null,
      },
      this.filters
    );

    this.tutorials = [
      ...[
        { id: 'all', inbox_description: 'All tutorials', abbreviation: '__all' },
        { id: 'mine', inbox_description: 'Just my tutorials', abbreviation: '__mine' },
      ],
      ...this.unit.tutorials,
    ];

    this.tutorials = this.tutorials.map((tutorial) => {
      if (!['all', 'mine'].includes(tutorial.id)) {
        if (tutorial.description.indexOf(tutorial.abbreviation) === -1) {
          tutorial.inbox_description = `${tutorial.abbreviation} - ${tutorial.description}`;
        }
      }
      return tutorial;
    });

    this.isTaskDefMode =
      this.taskData?.source === this.Unit.tasksForDefinition &&
      this.filters?.taskDefinitionIdSelected &&
      this.showSearchOptions;

    if (this.isTaskDefMode) {
      this.submissionsPdfsUrl = this.taskDef.getSubmissionsPdfsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
      this.submissionsUrl = this.taskDef.getSubmissionsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
    }

    this.tutorialIdChanged();

    this.setTaskDefFromTaskKey(this.taskData.taskKey);

    // Initially not watching the task key
    this.watchingTaskKey = false;
  }

  openDialog() {
    const dialogRef = this.dialog.open(this.searchDialog);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  refreshTasks(): void {
    this.refreshData();
  }

  applyFilters() {
    let filteredTasks = this.definedTasksPipe.transform(this.tasks, this.filters.taskDefinition);
    filteredTasks = this.tasksInTutorialsPipe.transform(filteredTasks, this.filters.tutorials);
    filteredTasks = this.taskWithSTudentNamePipe.transform(filteredTasks, this.filters.studentName);
    this.filteredTasks = filteredTasks;

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
    if (tutorialId === 'mine') {
      this.filters.tutorials = this.unit.tutorialsForUserName(this.currentUser.profile.name);
    } else if (tutorialId === 'all') {
      // Students not in tutorials but submitting work
      this.filters.tutorials = this.unit.tutorials.concat([{ id: null }]);
    } else {
      this.filters.tutorials = [this.unit.tutorialFromId(tutorialId)];
    }
    this.filters.tutorials = this.filters.tutorials.map((t) => t.id);
    this.applyFilters();
  }

  //  Task definition options
  groupSetName(id: number) {
    if (this.unit.hasGroupwork()) {
      this.groupService.groupSetName(id, this.unit);
    }
  }

  taskDefinitionIdChanged() {
    let taskDef;
    this.submissionsUrl = this.taskDef.getSubmissionsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
    this.submissionsPdfsUrl = this.taskDef.getSubmissionsPdfsUrl(this.unit.id, this.filters.taskDefinitionIdSelected);
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
      this.unit.task_definitions.find((x) => x.abbreviation === taskKey?.taskDefAbbr) || this.unit.task_definitions[0];
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
        // Load initial set task, either the one provided(by the URL)
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

  isSelectedTask(task) {
    const sameProject = this.taskData.selectedTask?.project().project_id === task.project().project_id;
    const sameTaskDef = this.taskData.selectedTask?.task_definition_id === task.task_definition_id;
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

  togglePin(task) {
    // toggle the tasks pin for user
  }
}
