import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAssessmentCardComponent } from './task-assessment-card.component';

describe('TaskAssessmentCardComponent', () => {
  let component: TaskAssessmentCardComponent;
  let fixture: ComponentFixture<TaskAssessmentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskAssessmentCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskAssessmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
