import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TransitionService} from '@uirouter/angular';
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

export type UnitTaskViewType = 'inbox' | 'explorer' | 'moderation' | 'overflow';
export type UnitTaskRouteMode = 'inbox' | 'definition' | 'moderation' | 'overflow';

export interface TaskKey {
  studentId: string | number;
  taskDefAbbr: string;
}

export interface TaskFilters {
  taskDefinition: TaskDefinition | null;
  tutorials: Tutorial[] | null;
  forceStream: boolean;
  studentName: string | null;
  tutorialIdSelected: string | number;
  unitRoleIdSelected: string | number;
  taskDefinitionIdSelected: number | TaskDefinition | null;
}

type TaskSource = (
  unit: Unit,
  taskDef?: TaskDefinition | number,
  fetchMyStudentsOnly?: boolean,
) => Observable<Task[]>;

@Component({
  selector: 'f-unit-task-inbox-state',
  templateUrl: './unit-task-inbox-state.component.html',
})
export class UnitTaskInboxStateComponent implements OnInit, OnDestroy {
  @Input() public unit$: Observable<Unit>;
  @Input() public routeMode: UnitTaskRouteMode = 'inbox';

  public viewType: UnitTaskViewType = 'inbox';
  public showSearchOptions = true;

  public unit: Unit;
  public unitRole: UnitRole;
  public studentsLoaded = false;
  public filters: Partial<TaskFilters> = {};

  public taskData: {
    taskKey: TaskKey | null;
    source: TaskSource;
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
      this.filters = {
        ...this.filters,
        ...this.getFilterOverrides(unit),
      };

      this.projectService
        .loadStudents(unit)
        .pipe(first())
        .subscribe({
          next: () => {
            this.studentsLoaded = true;
          },
          error: () => {
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

  private getTaskSource(): TaskSource {
    switch (this.routeMode) {
      case 'definition':
        return this.taskService.queryTasksForTaskExplorer.bind(this.taskService);
      case 'moderation':
        return this.taskService.queryTasksForMentorModeration.bind(this.taskService);
      case 'overflow':
        return this.taskService.queryTasksForOverflow.bind(this.taskService);
      case 'inbox':
      default:
        return this.taskService.queryTasksForTaskInbox.bind(this.taskService);
    }
  }

  private configureRouteMode(): void {
    this.taskData.source = this.getTaskSource();

    switch (this.routeMode) {
      case 'definition':
        this.viewType = 'explorer';
        this.showSearchOptions = true;
        this.taskData.taskDefMode = true;
        break;
      case 'moderation':
        this.viewType = 'moderation';
        this.showSearchOptions = false;
        this.taskData.taskDefMode = false;
        break;
      case 'overflow':
        this.viewType = 'overflow';
        this.showSearchOptions = false;
        this.taskData.taskDefMode = false;
        break;
      case 'inbox':
      default:
        this.viewType = 'inbox';
        this.showSearchOptions = true;
        this.taskData.taskDefMode = false;
        break;
    }
  }

  private getFilterOverrides(unit: Unit): Partial<TaskFilters> {
    switch (this.routeMode) {
      case 'definition':
        return {
          tutorialIdSelected: 'all',
          taskDefinitionIdSelected: unit.taskDefinitions?.[0]?.id ?? null,
        };
      case 'moderation':
      case 'overflow':
        return {
          tutorialIdSelected: 'all',
          taskDefinition: null,
          taskDefinitionIdSelected: null,
        };
      case 'inbox':
      default:
        return {};
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
