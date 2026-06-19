import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
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
});
