import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskPlagiarismCardComponent } from './task-plagiarism-card.component';

describe('TaskPlagiarismCardComponent', () => {
  let component: TaskPlagiarismCardComponent;
  let fixture: ComponentFixture<TaskPlagiarismCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TaskPlagiarismCardComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskPlagiarismCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
