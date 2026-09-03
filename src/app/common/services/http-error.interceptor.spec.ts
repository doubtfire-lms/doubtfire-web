import {beforeEach, describe, expect, it, vi} from 'vitest';
import {HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {AuthenticationService, UserService} from 'src/app/api/models/doubtfire-model';
import {HttpErrorInterceptor} from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let authenticationService: AuthenticationService;
  let userService: UserService;
  let interceptor: HttpErrorInterceptor;

  beforeEach(() => {
    userService = {
      currentUser: {
        authenticationToken: 'old-token',
        authenticationTokenExpiry: new Date(Date.now() + 60_000).toISOString(),
        username: 'test-user',
      },
    } as UserService;

    authenticationService = {
      attemptLoginUsingRefreshToken: vi.fn((callback: (result: boolean) => void) => {
        userService.currentUser.authenticationToken = 'new-token';
        callback(true);
      }),
      timeoutAuthentication: vi.fn(),
    } as unknown as AuthenticationService;

    interceptor = new HttpErrorInterceptor(authenticationService, userService);
  });

  it('refreshes and retries when the server rejects a token the client considers valid', () => {
    const request = new HttpRequest('GET', '/api/units');
    const next = {
      handle: vi
        .fn()
        .mockReturnValueOnce(
          throwError(() => new HttpErrorResponse({status: 419, statusText: 'Expired'})),
        )
        .mockReturnValueOnce(of(new HttpResponse({status: 200}))),
    } as unknown as HttpHandler;

    interceptor.intercept(request, next).subscribe();

    expect(authenticationService.attemptLoginUsingRefreshToken).toHaveBeenCalledOnce();
    expect(next.handle).toHaveBeenCalledTimes(2);
    const retriedRequest = vi.mocked(next.handle).mock.calls[1][0];
    expect(retriedRequest.headers.get('Auth-Token')).toBe('new-token');
    expect(retriedRequest.headers.get('Username')).toBe('test-user');
    expect(authenticationService.timeoutAuthentication).not.toHaveBeenCalled();
  });

  it('refreshes before requesting when the client considers the token expired', () => {
    userService.currentUser.authenticationTokenExpiry = new Date(Date.now() - 60_000).toISOString();
    const request = new HttpRequest('GET', '/api/units');
    const next = {
      handle: vi.fn().mockReturnValue(of(new HttpResponse({status: 200}))),
    } as unknown as HttpHandler;

    interceptor.intercept(request, next).subscribe();

    expect(authenticationService.attemptLoginUsingRefreshToken).toHaveBeenCalledOnce();
    expect(next.handle).toHaveBeenCalledOnce();
    expect(vi.mocked(next.handle).mock.calls[0][0].headers.get('Auth-Token')).toBe('new-token');
  });
});
