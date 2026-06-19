import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TaskService} from 'src/app/api/services/task.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {TaskAssessmentCardComponent} from './task-assessment-card.component';

const emptyProvider = {};

describe('TaskAssessmentCardComponent', () => {
  let component: TaskAssessmentCardComponent;
  let fixture: ComponentFixture<TaskAssessmentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskAssessmentCardComponent],
      providers: [
        {provide: TaskService, useValue: emptyProvider},
        {provide: GradeService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TaskAssessmentCardComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAssessmentCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
