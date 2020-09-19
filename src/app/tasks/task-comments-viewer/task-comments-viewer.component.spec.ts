import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskCommentsViewerComponent } from './task-comments-viewer.component';

describe('TaskCommentsViewerComponent', () => {
  let component: TaskCommentsViewerComponent;
  let fixture: ComponentFixture<TaskCommentsViewerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TaskCommentsViewerComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskCommentsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
