import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TaskDefinitionSubmissionDateComponent} from './task-definition-submission-date.component';

describe('TaskDefinitionSubmissionDateComponent', () => {
  let component: TaskDefinitionSubmissionDateComponent;
  let fixture: ComponentFixture<TaskDefinitionSubmissionDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDefinitionSubmissionDateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDefinitionSubmissionDateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
