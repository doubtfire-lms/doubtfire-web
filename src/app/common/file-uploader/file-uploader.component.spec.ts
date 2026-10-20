import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {UserService} from 'src/app/api/services/user.service';
import API_URL from 'src/app/config/constants/apiUrl';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {HttpAuthenticationInterceptor} from '../services/http-authentication.interceptor';
import {HttpErrorInterceptor} from '../services/http-error.interceptor';
import {FileUploaderComponent} from './file-uploader.component';

describe('FileUploaderComponent', () => {
  let httpMock: HttpTestingController;
  let userService: UserService;
  let authenticationService: AuthenticationService;
  let component: FileUploaderComponent;

  beforeEach(() => {
    vi.useFakeTimers();

    userService = {
      currentUser: {
        authenticationToken: 'expired-token',
        authenticationTokenExpiry: new Date(Date.now() + 60_000).toISOString(),
        username: 'test-user',
      },
      isAnonymousUser: vi.fn().mockReturnValue(false),
    } as unknown as UserService;

    authenticationService = {
      attemptLoginUsingRefreshToken: vi.fn((callback: (result: boolean) => void) => {
        userService.currentUser.authenticationToken = 'refreshed-token';
        callback(true);
      }),
      timeoutAuthentication: vi.fn(),
    } as unknown as AuthenticationService;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: UserService, useValue: userService},
        {provide: AuthenticationService, useValue: authenticationService},
        {
          provide: DoubtfireConstants,
          useValue: {ExternalName: new BehaviorSubject('OnTrack')},
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpAuthenticationInterceptor,
          multi: true,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    component = new FileUploaderComponent(
      TestBed.inject(HttpClient),
      TestBed.inject(DoubtfireConstants),
    );
    component.files = [{name: 'Submission', type: 'document'}];
    component.url = `${API_URL}/projects/1/task_def_id/2/submission`;
    component.ngOnInit();
    component.uploadZones[0].model = [new File(['submission'], 'submission.pdf')];
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('refreshes and retries an upload rejected with 419', () => {
    const onSuccess = vi.fn();
    component.onSuccess = onSuccess;

    component.initiateUploadInternal();

    const initialUpload = httpMock.expectOne((request: HttpRequest<FormData>) => {
      return request.url === component.url && request.headers.get('Auth-Token') === 'expired-token';
    });
    expect(initialUpload.request.body).toBeInstanceOf(FormData);
    initialUpload.flush(
      {error: 'Authentication token expired.'},
      {status: 419, statusText: 'CUSTOM'},
    );

    expect(authenticationService.attemptLoginUsingRefreshToken).toHaveBeenCalledOnce();
    const retriedUpload = httpMock.expectOne((request: HttpRequest<FormData>) => {
      return (
        request.url === component.url && request.headers.get('Auth-Token') === 'refreshed-token'
      );
    });
    expect(retriedUpload.request.body).toBe(initialUpload.request.body);
    retriedUpload.flush(JSON.stringify({id: 1, project_id: 1}));
    vi.runAllTimers();

    expect(onSuccess).toHaveBeenCalledWith({id: 1, project_id: 1});
    expect(authenticationService.timeoutAuthentication).not.toHaveBeenCalled();
  });
});
