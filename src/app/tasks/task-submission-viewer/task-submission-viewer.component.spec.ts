import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissionViewerComponent } from './task-submission-viewer.component';

describe('TaskSubmissionViewerComponent', () => {
  let component: TaskSubmissionViewerComponent;
  let fixture: ComponentFixture<TaskSubmissionViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskSubmissionViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSubmissionViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
