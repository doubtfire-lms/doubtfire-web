import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, first, of, tap} from 'rxjs';
import {
  ProjectService,
  TaskDefinition,
  Tutorial,
  Unit,
  UnitRole,
  UnitService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitTaskInboxStateComponent implements OnInit, OnDestroy {
  private static readonly UNIT_REFRESH_INTERVAL_MS = 60_000;
  private static readonly lastUnitFetchAt: Map<number, number> = new Map();

  @Input() public unit$: Observable<Unit>;
  @Input() public routeMode: UnitTaskRouteMode = 'inbox';

  public viewType: UnitTaskViewType = 'inbox';
  public showSearchOptions = true;

  public unit: Unit;
  public unitRole: UnitRole;
  public studentsLoaded = false;
  public filters: Partial<TaskFilters> = {};

  public get inboxLoading(): boolean {
    return !(this.unit && this.unitRole && this.studentsLoaded);
  }

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

  constructor(
    private taskService: TaskService,
    private globalStateService: GlobalStateService,
    private userService: UserService,
    private unitService: UnitService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private selectedTaskService: SelectedTaskService,
  ) {}

  ngOnInit(): void {
    this.globalStateService.setInboxState();
    this.clearSelectedTask();

    this.routeMode = this.route.snapshot.data.routeMode ?? this.routeMode;
    this.configureRouteMode();
    this.setTaskKeyFromRoute();

    const routeUnit = this.route.parent?.parent?.snapshot.data.unit;
    if (!this.unit$ && routeUnit) {
      this.unit$ = of(routeUnit);
    }

    this.unit$.pipe(first()).subscribe((routeUnit) => {
      this.loadUnit(routeUnit.id)
        .pipe(first())
        .subscribe((unit) => this.loadInboxData(unit));
    });

    this.route.paramMap.subscribe(() => {
      this.setTaskKeyFromRoute();
    });

    this.route.queryParamMap.subscribe(() => {
      this.setTaskKeyFromRoute();
    });
  }

  ngOnDestroy(): void {
    this.globalStateService.setNotInboxState();
    this.clearSelectedTask();
  }

  private clearSelectedTask(): void {
    this.taskData.selectedTask = null;
    this.taskData.taskKey = null;
    this.selectedTaskService.setSelectedTask(null);
  }

  private loadUnit(unitId: number): Observable<Unit> {
    if (this.shouldRefreshUnit(unitId)) {
      return this.unitService
        .fetch(unitId)
        .pipe(tap(() => UnitTaskInboxStateComponent.lastUnitFetchAt.set(unitId, Date.now())));
    }

    return this.unitService.get(unitId);
  }

  private shouldRefreshUnit(unitId: number): boolean {
    const lastFetchedAt = UnitTaskInboxStateComponent.lastUnitFetchAt.get(unitId);

    return (
      !lastFetchedAt ||
      Date.now() - lastFetchedAt > UnitTaskInboxStateComponent.UNIT_REFRESH_INTERVAL_MS
    );
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
        this.showSearchOptions = false;
        this.taskData.taskDefMode = false;
        break;
    }
  }

  private loadInboxData(unit: Unit): void {
    this.unit = unit;
    this.unitRole = this.findUnitRole(unit.id);
    if (this.unitRole) {
      this.unitRole.unit = unit;
      this.globalStateService.setView(ViewType.UNIT, this.unitRole);
    } else {
      this.globalStateService.setView(ViewType.UNIT, unit);
    }

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
  }

  private getFilterOverrides(unit: Unit): Partial<TaskFilters> {
    const selectedStudents = this.route.snapshot.queryParamMap.get('students');

    switch (this.routeMode) {
      case 'definition':
        return {
          tutorialIdSelected: selectedStudents ?? 'all',
          taskDefinitionIdSelected: unit.taskDefinitions?.[0]?.id ?? null,
        };
      case 'moderation':
      case 'overflow':
        return {
          tutorialIdSelected: selectedStudents ?? 'all',
          taskDefinition: null,
          taskDefinitionIdSelected: null,
        };
      case 'inbox':
      default:
        return selectedStudents ? {tutorialIdSelected: selectedStudents} : {};
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
      (this.userService.currentUser.role === 'Admin' ||
        this.userService.currentUser.role === 'Auditor')
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
    const currentTaskKey = this.currentTaskKeyFromRoute();

    if (currentTaskKey === nextTaskKey) {
      return;
    }

    if (this.route.parent?.parent?.snapshot.data.unit) {
      const [studentId, taskDefAbbr] = nextTaskKey?.split('/') ?? [null, null];

      this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: {
          students: this.filters.tutorialIdSelected ?? null,
          studentId,
          taskDefAbbr,
        },
        queryParamsHandling: 'merge',
      });
      return;
    }
  }

  private setTaskKeyFromUrlParams(taskKeyString?: string): void {
    this.taskData.taskKey = this.taskService.taskKeyFromString(taskKeyString);
  }

  private setTaskKeyFromRoute(): void {
    const studentId =
      this.route.snapshot.queryParamMap.get('studentId') ??
      this.route.snapshot.paramMap.get('studentId');
    const taskDefAbbr =
      this.route.snapshot.queryParamMap.get('taskDefAbbr') ??
      this.route.snapshot.paramMap.get('taskDefAbbr');

    if (studentId && taskDefAbbr) {
      this.taskData.taskKey = {studentId, taskDefAbbr};
      return;
    }

    this.setTaskKeyFromUrlParams();
  }

  private currentTaskKeyFromRoute(): string | null {
    const studentId =
      this.route.snapshot.queryParamMap.get('studentId') ??
      this.route.snapshot.paramMap.get('studentId');
    const taskDefAbbr =
      this.route.snapshot.queryParamMap.get('taskDefAbbr') ??
      this.route.snapshot.paramMap.get('taskDefAbbr');

    if (!studentId || !taskDefAbbr) {
      return null;
    }

    return `${studentId}/${taskDefAbbr}`;
  }
}
