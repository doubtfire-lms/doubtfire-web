import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCommentsViewerComponent } from './task-comments-viewer.component';

describe('TaskCommentsViewerComponent', () => {
  let component: TaskCommentsViewerComponent;
  let fixture: ComponentFixture<TaskCommentsViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskCommentsViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskCommentsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
