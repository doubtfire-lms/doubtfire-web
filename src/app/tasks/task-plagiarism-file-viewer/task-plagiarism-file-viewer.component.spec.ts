import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskPlagiarismFileViewerComponent } from './task-plagiarism-file-viewer.component';

describe('TaskPlagiarismFileViewerComponent', () => {
  let component: TaskPlagiarismFileViewerComponent;
  let fixture: ComponentFixture<TaskPlagiarismFileViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskPlagiarismFileViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskPlagiarismFileViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
