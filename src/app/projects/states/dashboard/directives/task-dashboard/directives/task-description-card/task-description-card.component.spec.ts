import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDescriptionCardComponent } from './task-description-card.component';

describe('TaskDescriptionCardComponent', () => {
  let component: TaskDescriptionCardComponent;
  let fixture: ComponentFixture<TaskDescriptionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDescriptionCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDescriptionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
