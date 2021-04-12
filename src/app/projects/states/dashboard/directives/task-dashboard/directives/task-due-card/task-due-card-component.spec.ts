import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskDueCardComponent } from './task-due-card.component';
describe('TaskDueCardComponent', () => {
    let component: TaskDueCardComponent;
    let fixture: ComponentFixture<TaskDueCardComponent>;
  
    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          declarations: [TaskDueCardComponent],
        }).compileComponents();
      })
    );
  
    beforeEach(() => {
      fixture = TestBed.createComponent(TaskDueCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });
  