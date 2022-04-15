import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UIRouterModule } from '@uirouter/angular';

import { TaskDropdownComponent } from './task-dropdown.component';

describe('TaskDropdownComponent', () => {
  let component: TaskDropdownComponent;
  let fixture: ComponentFixture<TaskDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskDropdownComponent],
      imports: [UIRouterModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
