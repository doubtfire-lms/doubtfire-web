import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDueCardComponent } from './task-due-card.component';

describe('TaskDueCardComponent', () => {
  let component: TaskDueCardComponent;
  let fixture: ComponentFixture<TaskDueCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDueCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDueCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
