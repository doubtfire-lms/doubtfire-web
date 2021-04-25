import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskSubmissionCardComponent } from './task-submission-card.component';

describe('TaskSubmissionCardComponent', () => {
  let component: TaskSubmissionCardComponent;
  let fixture: ComponentFixture<TaskSubmissionCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TaskSubmissionCardComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSubmissionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});