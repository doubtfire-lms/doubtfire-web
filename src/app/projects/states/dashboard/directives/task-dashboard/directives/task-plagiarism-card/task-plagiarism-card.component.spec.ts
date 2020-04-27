import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskPlagiarismCardComponent } from './task-plagiarism-card.component';

describe('TaskPlagiarismCardComponent', () => {
  let component: TaskPlagiarismCardComponent;
  let fixture: ComponentFixture<TaskPlagiarismCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskPlagiarismCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskPlagiarismCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
