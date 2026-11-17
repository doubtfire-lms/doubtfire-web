import {beforeEach, describe, expect, it, vi} from 'vitest';
import {HttpClient} from '@angular/common/http';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {SignInComponent} from './sign-in.component';

const emptyProvider = {};

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authenticationService: {
    signIn: ReturnType<typeof vi.fn>;
    afterAuthCall: ReturnType<typeof vi.fn>;
  };
  let router: {navigate: ReturnType<typeof vi.fn>};
  let globalState: {onLoad: ReturnType<typeof vi.fn>};

  beforeEach(async () => {
    authenticationService = {
      signIn: vi.fn(() => of(undefined)),
      afterAuthCall: vi.fn(),
    };
    router = {navigate: vi.fn()};
    globalState = {onLoad: vi.fn()};

    await TestBed.configureTestingModule({
      declarations: [SignInComponent],
      providers: [
        {provide: AuthenticationService, useValue: authenticationService},
        {provide: UserService, useValue: emptyProvider},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: emptyProvider},
        {provide: DoubtfireConstants, useValue: emptyProvider},
        {provide: HttpClient, useValue: emptyProvider},
        {provide: GlobalStateService, useValue: globalState},
        {provide: AlertService, useValue: emptyProvider},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SignInComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('removes a one-time token from history before attempting sign-in', () => {
    const originalUrl = window.location.href;
    try {
      window.history.replaceState({}, '', '/sign_in?authToken=one-time-token&username=user');

      component.ngOnInit();

      expect(component.authToken).toBe('one-time-token');
      expect(window.location.pathname + window.location.search).toBe('/sign_in?username=user');
    } finally {
      window.history.replaceState({}, '', originalUrl);
    }
  });

  it('uses the cookie-backed LTI session without propagating an ltik', () => {
    const credentials = {
      auth_token: 'one-time-token',
      username: 'user',
      remember: true,
    };
    component.isLtiLogin = true;

    component.signIn(credentials);

    expect(authenticationService.signIn).toHaveBeenCalledWith(credentials);
    expect(router.navigate).toHaveBeenCalledWith(['/lti'], {replaceUrl: true});
    expect(sessionStorage.getItem('ltiLaunch')).toBe('true');
    sessionStorage.removeItem('ltiLaunch');
  });
});
