import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {Task, TaskDefinition} from 'src/app/api/models/doubtfire-model';
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

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
