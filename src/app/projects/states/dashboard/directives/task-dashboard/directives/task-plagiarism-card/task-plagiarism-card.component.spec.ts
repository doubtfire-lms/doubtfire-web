import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { plagiarismReportModal } from 'src/app/ajs-upgraded-providers';

import { TaskPlagiarismCardComponent } from './task-plagiarism-card.component';

describe('TaskPlagiarismCardComponent', () => {
  let component: TaskPlagiarismCardComponent;
  let fixture: ComponentFixture<TaskPlagiarismCardComponent>;
  let plagiarismReportModalStub: jasmine.SpyObj<any>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TaskPlagiarismCardComponent],
        providers: [{ provide: plagiarismReportModal, useValue: plagiarismReportModalStub }],
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
