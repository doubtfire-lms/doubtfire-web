import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissionCardComponent } from './task-submission-card.component';

describe('TaskSubmissionCardComponent', () => {
  let component: TaskSubmissionCardComponent;
  let fixture: ComponentFixture<TaskSubmissionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskSubmissionCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskSubmissionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
