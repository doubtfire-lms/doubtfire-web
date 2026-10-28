import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {UnitRole, User, UserService} from 'src/app/api/models/doubtfire-model';
import {TaskDropdownComponent} from './task-dropdown.component';

describe('TaskDropdownComponent', () => {
  let component: TaskDropdownComponent;
  let fixture: ComponentFixture<TaskDropdownComponent>;
  let currentUser: User;

  beforeEach(async () => {
    currentUser = new User();
    currentUser.systemRole = 'Student';

    await TestBed.configureTestingModule({
      declarations: [TaskDropdownComponent],
      imports: [RouterTestingModule],
      providers: [{provide: UserService, useValue: {currentUser}}],
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

  it('allows a system administrator with a tutor unit role to administer the unit', () => {
    currentUser.systemRole = 'Admin';
    component.unitRole = {role: 'Tutor'} as UnitRole;

    expect(component.canAdministerUnit).toBe(true);
  });
});
