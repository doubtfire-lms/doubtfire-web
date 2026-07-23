import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Task} from 'src/app/api/models/task';
import {TaskDueCardComponent} from './task-due-card.component';

describe('TaskDueCardComponent', () => {
  let component: TaskDueCardComponent;
  let fixture: ComponentFixture<TaskDueCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskDueCardComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TaskDueCardComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDueCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates when the API-provided discussion deadline changes', () => {
    const year = new Date().getFullYear();
    component.task = {
      status: 'discuss',
      discussTimeoutExpiryAt: new Date(year, 6, 8),
      unit: {
        discussTimeoutEnabled: true,
        discussTimeoutExpireDays: 7,
      },
    } as Task;

    expect(component.discussTimeoutExpiryDate).toBe('8th July');

    component.task.discussTimeoutExpiryAt = new Date(year, 6, 15);

    expect(component.discussTimeoutExpiryDate).toBe('15th July');
  });
});
