import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TaskDefinitionSubmissionDateComponent} from './task-definition-submission-date.component';

describe('TaskDefinitionSubmissionDateComponent', () => {
  let component: TaskDefinitionSubmissionDateComponent;
  let fixture: ComponentFixture<TaskDefinitionSubmissionDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskDefinitionSubmissionDateComponent],
      imports: [
        FormsModule,
        MatButtonModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDefinitionSubmissionDateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('taskDefinition', new TaskDefinition(null));
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
