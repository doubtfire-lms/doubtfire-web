import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TransitionService} from '@uirouter/angular';
import {NgHybridStateDeclaration} from '@uirouter/angular-hybrid';
import {StateService} from '@uirouter/core';
import {Observable, first} from 'rxjs';
import {
  ProjectService,
  TaskDefinition,
  Tutorial,
  Unit,
  UnitRole,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

type UnitTaskRouteMode = 'inbox' | 'definition' | 'moderation' | 'overflow';
type UnitTaskViewType = 'inbox' | 'explorer' | 'moderation' | 'overflow';

interface TaskKey {
  studentId: string | number;
  taskDefAbbr: string;
}

interface TaskFilters {
  taskDefinition: TaskDefinition | null;
  tutorials: Tutorial[] | null;
  forceStream: boolean;
  studentName: string | null;
  tutorialIdSelected: string | number;
  unitRoleIdSelected: string | number;
  taskDefinitionIdSelected: number | TaskDefinition | null;
}

@Component({
  selector: 'f-unit-task-inbox-state',
  templateUrl: './unit-task-inbox-state.component.html',
})
export class UnitTaskInboxStateComponent implements OnInit, OnDestroy {
  @Input() public unit$: Observable<Unit>;
  @Input() public routeMode: UnitTaskRouteMode = 'inbox';

  public unit: Unit;
  public unitRole: UnitRole;
  public viewType: UnitTaskViewType = 'inbox';
  public showSearchOptions = true;
  public studentsLoaded = false;

  public filters: TaskFilters = {
    taskDefinition: null,
    tutorials: null,
    forceStream: true,
    studentName: null,
    tutorialIdSelected: 'all',
    unitRoleIdSelected: 'all',
    taskDefinitionIdSelected: null,
  };

  public taskData: {
    taskKey: TaskKey | null;
    source: (
      unit: Unit,
      taskDef?: TaskDefinition | number,
      fetchMyStudentsOnly?: boolean,
    ) => Observable<Task[]>;
    selectedTask: Task | null;
    onSelectedTaskChange: (task: Task | null) => void;
    taskDefMode: boolean;
  } = {
    taskKey: null,
    source: null,
    selectedTask: null,
    onSelectedTaskChange: (task: Task | null) => {
      this.taskData.selectedTask = task;
      this.taskData.taskKey = task?.taskKey() ?? null;
      this.setTaskKeyAsUrlParams(task);
    },
    taskDefMode: false,
  };

  private deregisterStateSuccessHook?: () => void;

  constructor(
    private taskService: TaskService,
    private stateService: StateService,
    private transitionService: TransitionService,
    private globalStateService: GlobalStateService,
    private userService: UserService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.configureRouteMode();
    this.setTaskKeyFromUrlParams(this.stateService.params.taskKey);

    this.unit$.pipe(first()).subscribe((unit) => {
      this.unit = unit;
      this.unitRole = this.findUnitRole(unit.id);
      this.applyUnitDefaultsForRouteMode(unit);

      this.projectService
        .loadStudents(unit)
        .pipe(first())
        .subscribe({
          next: () => {
            this.studentsLoaded = true;
          },
          error: () => {
            // Allow route to render even if student preloading fails.
            this.studentsLoaded = true;
          },
        });
    });

    const deregister = this.transitionService.onSuccess({to: '**'}, (transition) => {
      const stateName = transition.to().name;
      if (stateName.startsWith('units2/tasks/')) {
        this.setTaskKeyFromUrlParams(transition.params().taskKey);
      }
    });

    this.deregisterStateSuccessHook = deregister as () => void;
  }

  ngOnDestroy(): void {
    this.deregisterStateSuccessHook?.();
  }

  private configureRouteMode(): void {
    switch (this.routeMode) {
      case 'definition':
        this.taskData.source = this.taskService.queryTasksForTaskExplorer.bind(this.taskService);
        this.viewType = 'explorer';
        this.showSearchOptions = true;
        this.taskData.taskDefMode = true;
        break;
      case 'moderation':
        this.taskData.source = this.taskService.queryTasksForMentorModeration.bind(this.taskService);
        this.viewType = 'moderation';
        this.showSearchOptions = false;
        this.taskData.taskDefMode = false;
        break;
      case 'overflow':
        this.taskData.source = this.taskService.queryTasksForOverflow.bind(this.taskService);
        this.viewType = 'overflow';
        this.showSearchOptions = false;
        this.taskData.taskDefMode = false;
        break;
      case 'inbox':
      default:
        this.taskData.source = this.taskService.queryTasksForTaskInbox.bind(this.taskService);
        this.viewType = 'inbox';
        this.showSearchOptions = true;
        this.taskData.taskDefMode = false;
        break;
    }
  }

  private applyUnitDefaultsForRouteMode(unit: Unit): void {
    if (this.routeMode === 'definition') {
      this.filters = {
        ...this.filters,
        taskDefinitionIdSelected: unit.taskDefinitions?.[0]?.id ?? null,
      };
      return;
    }

    if (this.routeMode === 'moderation' || this.routeMode === 'overflow') {
      this.filters = {
        ...this.filters,
        tutorialIdSelected: 'all',
        taskDefinition: null,
        taskDefinitionIdSelected: null,
      };
    }
  }

  private findUnitRole(unitId: number): UnitRole {
    const currentView = this.globalStateService.currentViewAndEntitySubject$.value;

    if (currentView?.viewType === ViewType.UNIT) {
      const currentUnitRole = currentView.entity as UnitRole;
      if (currentUnitRole?.unit?.id === unitId) {
        return currentUnitRole;
      }
    }

    let unitRole = this.globalStateService.loadedUnitRoles.currentValues.find(
      (role) => role.unit.id === unitId,
    );

    if (
      !unitRole &&
      (this.userService.currentUser.role === 'Admin' || this.userService.currentUser.role === 'Auditor')
    ) {
      unitRole = this.userService.adminOrAuditorRoleFor(
        this.userService.currentUser.role,
        unitId,
        this.userService.currentUser,
      );
    }

    return unitRole;
  }

  private setTaskKeyAsUrlParams(task: Task | null): void {
    const nextTaskKey = task?.taskKeyToUrlString() ?? null;
    const currentTaskKey = this.stateService.params.taskKey ?? null;

    if (currentTaskKey === nextTaskKey) {
      return;
    }

    this.stateService.go('.', {taskKey: nextTaskKey}, {notify: false, location: 'replace'});
  }

  private setTaskKeyFromUrlParams(taskKeyString?: string): void {
    this.taskData.taskKey = this.taskService.taskKeyFromString(taskKeyString);
  }
}

function createUnitTaskState(
  name: string,
  url: string,
  task: string,
  routeMode: UnitTaskRouteMode,
): NgHybridStateDeclaration {
  return {
    name,
    parent: 'unit-root-state',
    url,
    params: {
      taskKey: {value: null, squash: true, dynamic: true},
    },
    resolve: {
      routeMode: function () {
        return routeMode;
      },
    },
    views: {
      unitView: {
        component: UnitTaskInboxStateComponent,
      },
    },
    data: {
      task,
      pageTitle: '_Home_',
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor'],
    },
  };
}

export const UnitTaskInboxState: NgHybridStateDeclaration = createUnitTaskState(
  'units2/tasks/inbox',
  '/tasks/inbox/{taskKey:any}',
  'Task Inbox',
  'inbox',
);

export const UnitTaskDefinitionState: NgHybridStateDeclaration = createUnitTaskState(
  'units2/tasks/definition',
  '/tasks/definition/{taskKey:any}',
  'Task Explorer',
  'definition',
);

export const UnitTaskModerationState: NgHybridStateDeclaration = createUnitTaskState(
  'units2/tasks/moderation',
  '/tasks/moderation/{taskKey:any}',
  'Task Moderation',
  'moderation',
);

export const UnitTaskOverflowState: NgHybridStateDeclaration = createUnitTaskState(
  'units2/tasks/overflow',
  '/tasks/overflow/{taskKey:any}',
  'Task Overflow',
  'overflow',
);
