import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router, convertToParamMap} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {Project, Task, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {FUnitTaskListComponent} from './unit-task-list.component';

const emptyProvider = {};

const taskDefinition = (
  id: number,
  abbreviation: string,
  startDate = new Date(2026, 0, id + 1),
): TaskDefinition =>
  ({
    id,
    seq: id,
    abbreviation,
    name: abbreviation,
    startDate,
  }) as TaskDefinition;

const taskForDefinition = (definition: TaskDefinition, topWeight: number): Task =>
  ({
    definition,
    topWeight,
  }) as Task;

describe('FUnitTaskListComponent', () => {
  let component: FUnitTaskListComponent;
  let fixture: ComponentFixture<FUnitTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FUnitTaskListComponent],
      providers: [
        {provide: Router, useValue: emptyProvider},
        {provide: ActivatedRoute, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(FUnitTaskListComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FUnitTaskListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switches the selected task when the reused route parameter changes', async () => {
    const params: Subject<ReturnType<typeof convertToParamMap>> = new Subject();
    const firstTask = taskDefinition(1, 'P1');
    const secondTask = taskDefinition(2, 'P2');
    const selectedTaskDefinition$: BehaviorSubject<TaskDefinition> = new BehaviorSubject(firstTask);
    const routeAwareComponent = new FUnitTaskListComponent(
      emptyProvider as Router,
      {paramMap: params.asObservable()} as ActivatedRoute,
    );
    routeAwareComponent.project = {} as Project;
    routeAwareComponent.taskDefinitions = [firstTask, secondTask];
    routeAwareComponent.tasks = [];
    routeAwareComponent.selectedTaskDefinition$ = selectedTaskDefinition$;
    routeAwareComponent.ngOnInit();

    params.next(convertToParamMap({taskAbbreviation: 'P2'}));
    await Promise.resolve();

    expect(selectedTaskDefinition$.value).toBe(secondTask);
    routeAwareComponent.ngOnDestroy();
  });

  it('shows the ongoing state after a task starts and before it is due', () => {
    const now = new Date(2026, 7, 22, 12).getTime();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const task = {
      startDate: new Date(now - 9 * 24 * 60 * 60 * 1000),
      localDueDate: () => new Date(now + 5 * 24 * 60 * 60 * 1000),
      inFinalState: () => false,
    } as Task;

    expect(component.taskOngoing(task)).toBe(true);
  });

  it('ends the ongoing state when the task reaches its due date', () => {
    const now = new Date(2026, 7, 22, 12).getTime();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const task = {
      startDate: new Date(now - 14 * 24 * 60 * 60 * 1000),
      localDueDate: () => new Date(now),
      inFinalState: () => false,
    } as Task;

    expect(component.taskOngoing(task)).toBe(false);
  });

  it('shows the due state when a started task is due within five days', () => {
    const task = {
      isBeforeStartDate: () => false,
      inSubmittedState: () => false,
      daysUntilDueDate: () => 5,
    } as Task;

    expect(component.taskDueApproaching(task)).toBe(true);
  });

  it('does not show the due state more than five days before the due date', () => {
    const task = {
      isBeforeStartDate: () => false,
      inSubmittedState: () => false,
      daysUntilDueDate: () => 6,
    } as Task;

    expect(component.taskDueApproaching(task)).toBe(false);
  });

  it('sorts task definitions by task top weight by default', () => {
    const middlePriorityTask = taskDefinition(0, 'C');
    const lowPriorityTask = taskDefinition(1, 'A');
    const highPriorityTask = taskDefinition(2, 'B');
    component.taskDefinitions = [lowPriorityTask, middlePriorityTask, highPriorityTask];
    component.tasks = [
      taskForDefinition(middlePriorityTask, 1),
      taskForDefinition(lowPriorityTask, 2),
      taskForDefinition(highPriorityTask, 0),
    ];

    component.applyFilters();

    expect(component.filteredTaskDefinitions).toEqual([
      highPriorityTask,
      middlePriorityTask,
      lowPriorityTask,
    ]);
  });

  it('restores top weight order when switching back to default sorting', () => {
    const middlePriorityTask = taskDefinition(0, 'C');
    const lowPriorityTask = taskDefinition(1, 'A');
    const highPriorityTask = taskDefinition(2, 'B');
    component.taskDefinitions = [lowPriorityTask, middlePriorityTask, highPriorityTask];
    component.tasks = [
      taskForDefinition(middlePriorityTask, 1),
      taskForDefinition(lowPriorityTask, 2),
      taskForDefinition(highPriorityTask, 0),
    ];

    component.setSortBy('abbreviation');
    expect(component.filteredTaskDefinitions).toEqual([
      lowPriorityTask,
      highPriorityTask,
      middlePriorityTask,
    ]);

    component.setSortBy('default');
    expect(component.filteredTaskDefinitions).toEqual([
      highPriorityTask,
      middlePriorityTask,
      lowPriorityTask,
    ]);
  });

  it('falls back to task definition sequence when no task is available', () => {
    const firstTask = taskDefinition(0, 'C');
    const secondTask = taskDefinition(1, 'A');
    const thirdTask = taskDefinition(2, 'B');
    component.taskDefinitions = [thirdTask, firstTask, secondTask];

    component.applyFilters();

    expect(component.filteredTaskDefinitions).toEqual([firstTask, secondTask, thirdTask]);
  });

  it('hides tasks beyond the project target grade by default', () => {
    const targetGradeTask = {
      ...taskDefinition(0, 'P'),
      targetGrade: 1,
    } as TaskDefinition;
    const beyondTargetGradeTask = {
      ...taskDefinition(1, 'C'),
      targetGrade: 2,
    } as TaskDefinition;
    component.project = {targetGrade: 1} as Project;
    component.taskDefinitions = [targetGradeTask, beyondTargetGradeTask];

    component.applyFilters();

    expect(component.filteredTaskDefinitions).toEqual([targetGradeTask]);
  });

  it('shows tasks beyond the target grade without adding a filter badge', () => {
    const targetGradeTask = {
      ...taskDefinition(0, 'P'),
      targetGrade: 1,
    } as TaskDefinition;
    const beyondTargetGradeTask = {
      ...taskDefinition(1, 'C'),
      targetGrade: 2,
    } as TaskDefinition;
    component.project = {targetGrade: 1} as Project;
    component.taskDefinitions = [targetGradeTask, beyondTargetGradeTask];

    component.toggleShowBeyondTargetGrade(true);

    expect(component.filteredTaskDefinitions).toEqual([targetGradeTask, beyondTargetGradeTask]);
    expect(component.activeViewPreferenceCount).toBe(0);
    expect(component.hasModifiedViewPreferences).toBe(true);
  });
});
