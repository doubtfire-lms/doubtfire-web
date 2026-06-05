/* eslint-disable @typescript-eslint/no-explicit-any */
import {BehaviorSubject, Observable, Subject, throwError} from 'rxjs';
import {AuthenticationService, UserService} from 'src/app/api/models/doubtfire-model';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, filter, finalize, switchMap, take} from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;
  private refreshTokenSubject: Subject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
  ) {}

  attemptRefresh$(): Observable<void> {
    return new Observable<void>((observer) => {
      this.authenticationService.attemptLoginUsingRefreshToken((result: boolean) => {
        if (result) {
          observer.next();
          observer.complete();
        } else {
          this.authenticationService.timeoutAuthentication();
          this.refreshTokenInProgress = false;
          observer.error(new Error('Authentication timed out'));
        }
      }, false); // Don't display splashscreen
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const retryTimes: number = 3;
    // const delayDuration: number = 100;

    // TODO: Check for access token / refresh token expiration before trying the initial request
    // .. This way we can avoid spamming console with 409 errors

    return next.handle(request).pipe(
      // retryWhen(errors => errors
      //   .pipe(
      //     concatMap((error, count) => {
      //       if (count < retryTimes && (error.status === 400 || error.status === 0)) {
      //         return of(error.status);
      //       }
      //       return throwError(error);
      //     }),
      //     delay(delayDuration)
      //   )
      // ),
      catchError((error: HttpErrorResponse) => {
        if (this.isAuthError(error)) {
          if (!this.refreshTokenInProgress) {
            this.refreshTokenInProgress = true;
            this.refreshTokenSubject.next(null);
            return this.attemptRefresh$().pipe(
              switchMap(() => {
                this.refreshTokenSubject.next(this.userService.currentUser.authenticationToken);
                return next.handle(this.injectToken(request));
              }),
              catchError((err: HttpErrorResponse) => {
                this.refreshTokenInProgress = false;
                if (this.isAuthError(err)) {
                  this.authenticationService.timeoutAuthentication();
                }
                return throwError(() => this.extractErrorMessage(err));
              }),
              finalize(() => (this.refreshTokenInProgress = false)),
            );
          } else {
            return this.refreshTokenSubject.pipe(
              filter((result) => result !== null),
              take(1),
              switchMap((_res) => {
                return next.handle(this.injectToken(request));
              }),
            );
          }
        }

        return throwError(() => this.extractErrorMessage(error));
      }),
    );
  }

  private isAuthError(error: HttpErrorResponse) {
    return error.status === 419 || (error.status === 403 && this.userService.isAnonymousUser());
  }

  private extractErrorMessage(error: HttpErrorResponse) {
    let errorMessage: string = '';
    let logMessage: string = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = error.error.message;
    } else if (error.error instanceof ProgressEvent) {
      errorMessage = error.statusText;
    } else {
      // server-side error
      if (error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error instanceof Blob) {
        errorMessage = error.statusText;
      } else {
        errorMessage = error.error;
      }
      logMessage = `Error Code: ${error.status}`;
    }

    console.error(`${logMessage}: ${errorMessage}`);
    return errorMessage;
  }

  injectToken(request: HttpRequest<any>) {
    return request.clone({
      setHeaders: {
        'Auth-Token': this.userService.currentUser.authenticationToken,
        Username: this.userService.currentUser.username,
      },
    });
  }
}
