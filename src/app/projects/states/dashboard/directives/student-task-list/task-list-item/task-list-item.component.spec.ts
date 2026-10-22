import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Task} from 'src/app/api/models/doubtfire-model';
import {TaskListItemComponent} from './task-list-item.component';

describe('TaskListItemComponent', () => {
  let component: TaskListItemComponent;
  let fixture: ComponentFixture<TaskListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskListItemComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TaskListItemComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(TaskListItemComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the ongoing state after a task starts and before it is due', () => {
    const now = new Date(2026, 7, 22, 12).getTime();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    component.task = {
      startDate: new Date(now - 9 * 24 * 60 * 60 * 1000),
      localDueDate: () => new Date(now + 5 * 24 * 60 * 60 * 1000),
      inFinalState: () => false,
    } as Task;

    expect(component.taskOngoing()).toBe(true);
  });

  it('ends the ongoing state when the task reaches its due date', () => {
    const now = new Date(2026, 7, 22, 12).getTime();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    component.task = {
      startDate: new Date(now - 14 * 24 * 60 * 60 * 1000),
      localDueDate: () => new Date(now),
      inFinalState: () => false,
    } as Task;

    expect(component.taskOngoing()).toBe(false);
  });

  it('shows the due state when a started task is due within five days', () => {
    component.task = {
      isBeforeStartDate: () => false,
      inSubmittedState: () => false,
      daysUntilDueDate: () => 5,
    } as Task;

    expect(component.taskDueApproaching()).toBe(true);
  });

  it('does not show the due state more than five days before the due date', () => {
    component.task = {
      isBeforeStartDate: () => false,
      inSubmittedState: () => false,
      daysUntilDueDate: () => 6,
    } as Task;

    expect(component.taskDueApproaching()).toBe(false);
  });
});
