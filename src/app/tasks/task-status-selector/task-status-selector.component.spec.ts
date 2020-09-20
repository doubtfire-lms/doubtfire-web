import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStatusSelectorComponent } from './task-status-selector.component';

describe('TaskStatusSelectorComponent', () => {
  let component: TaskStatusSelectorComponent;
  let fixture: ComponentFixture<TaskStatusSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskStatusSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskStatusSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
