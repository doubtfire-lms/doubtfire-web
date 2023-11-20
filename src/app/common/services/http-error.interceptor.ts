/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AuthenticationService, UserService } from 'src/app/api/models/doubtfire-model';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService, private userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const retryTimes: number = 3;
    // const delayDuration: number = 100;

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
        let errorMessage: string = '';
        let logMessage: string = '';
        if (error.error instanceof ErrorEvent) {
          // client-side error
          errorMessage = error.error.message;
        } else if (error.error instanceof ProgressEvent) {
          errorMessage = error.statusText;
        } else {
          // server-side error
          errorMessage = error.error.error;
          logMessage = `Error Code: ${error.status}`;
        }

        console.error(`${logMessage}: ${errorMessage}`);

        if (error.status === 419 || (error.status === 403 && this.userService.isAnonymousUser())) {
          this.authenticationService.timeoutAuthentication();
        }

        return throwError(() => errorMessage);
      })
    );
  }
}
