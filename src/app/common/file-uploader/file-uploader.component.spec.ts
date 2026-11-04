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
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {UserService} from 'src/app/api/services/user.service';
import API_URL from 'src/app/config/constants/apiUrl';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SubmissionRequestDeniedModalComponent} from 'src/app/tasks/modals/submission-request-denied-modal/submission-request-denied-modal.component';
import {HttpAuthenticationInterceptor} from '../services/http-authentication.interceptor';
import {HttpErrorInterceptor} from '../services/http-error.interceptor';
import {FileUploaderComponent} from './file-uploader.component';

describe('FileUploaderComponent', () => {
  let httpMock: HttpTestingController;
  let userService: UserService;
  let authenticationService: AuthenticationService;
  let component: FileUploaderComponent;
  let dialog: {open: ReturnType<typeof vi.fn>};

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
    dialog = {open: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: UserService, useValue: userService},
        {provide: AuthenticationService, useValue: authenticationService},
        {provide: MatDialog, useValue: dialog},
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
      TestBed.inject(MatDialog),
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

  it('shows the request denial dialog instead of reporting a WAF response as a successful upload', () => {
    const onSuccess = vi.fn();
    const onComplete = vi.fn();
    component.onSuccess = onSuccess;
    component.onComplete = onComplete;

    component.initiateUploadInternal();
    const upload = httpMock.expectOne(component.url);
    upload.flush(`
      <html><head><title>Request Rejected</title></head>
      <body>The requested URL was rejected. Please consult with your administrator.<br/>
      Your support ID is b4b53a74-94f5-49d3-9b1b-3a8ba045d199<br/></body></html>
    `);
    vi.runAllTimers();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(component.uploadingInfo.success).toBe(false);
    expect(dialog.open).toHaveBeenCalledWith(
      SubmissionRequestDeniedModalComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          supportId: 'b4b53a74-94f5-49d3-9b1b-3a8ba045d199',
        }),
      }),
    );
  });

  it('lets the submission modal handle the denial without opening a second dialog', () => {
    const onRequestDenied = vi.fn();
    component.onRequestDenied = onRequestDenied;

    component.initiateUploadInternal();
    const upload = httpMock.expectOne(component.url);
    upload.flush(`
      <html><head><title>Request Rejected</title></head>
      <body>The requested URL was rejected.<br/>
      Your support ID is b4b53a74-94f5-49d3-9b1b-3a8ba045d199<br/></body></html>
    `);
    vi.runAllTimers();

    expect(onRequestDenied).toHaveBeenCalledWith('b4b53a74-94f5-49d3-9b1b-3a8ba045d199');
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('does not report an unexpected HTML response as a successful upload', () => {
    const onSuccess = vi.fn();
    component.onSuccess = onSuccess;

    component.initiateUploadInternal();
    httpMock.expectOne(component.url).flush('<html><body>Unexpected response</body></html>');
    vi.runAllTimers();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(component.uploadingInfo.success).toBe(false);
    expect(dialog.open).not.toHaveBeenCalled();
  });
});
