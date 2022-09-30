import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStatusCardComponent } from './task-status-card.component';

describe('TaskStatusCardComponent', () => {
  let component: TaskStatusCardComponent;
  let fixture: ComponentFixture<TaskStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskStatusCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskStatusCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
