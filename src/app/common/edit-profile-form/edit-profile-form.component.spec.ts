import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {throwError} from 'rxjs';
import {User} from 'src/app/api/models/user/user';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {EditProfileFormComponent} from './edit-profile-form.component';

describe('EditProfileFormComponent', () => {
  let component: EditProfileFormComponent;
  let fixture: ComponentFixture<EditProfileFormComponent>;
  let user: User;
  let userService: {currentUser: User; update: ReturnType<typeof vi.fn>};
  let alertService: {error: ReturnType<typeof vi.fn>};

  beforeEach(async () => {
    user = new User();
    user.id = 1;
    user.firstName = 'Test';
    user.lastName = 'Student';
    user.nickname = 'Test';
    userService = {currentUser: user, update: vi.fn()};
    alertService = {error: vi.fn()};

    await TestBed.configureTestingModule({
      declarations: [EditProfileFormComponent],
      providers: [
        {provide: DoubtfireConstants, useValue: {}},
        {provide: UserService, useValue: userService},
        {provide: Router, useValue: {}},
        {provide: AuthenticationService, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {user, mode: 'edit', modal: false}},
        {provide: MatSnackBar, useValue: {open: vi.fn()}},
        {provide: AlertService, useValue: alertService},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditProfileFormComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each([
    'Validation failed: First name contains unsupported characters',
    {error: 'Validation failed: First name contains unsupported characters'},
    {error: {error: 'Validation failed: First name contains unsupported characters'}},
  ])('shows the backend validation error when saving a profile', (error) => {
    userService.update.mockReturnValue(throwError(() => error));

    component.submit();

    expect(alertService.error).toHaveBeenCalledWith(
      'Validation failed: First name contains unsupported characters',
      6000,
    );
  });
});
