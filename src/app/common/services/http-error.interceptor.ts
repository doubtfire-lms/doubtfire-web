import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { AuthenticationService } from 'src/app/api/models/doubtfire-model';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService
  ){}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const retryTimes: number = 3;
    // const delayDuration: number = 100;

    return next.handle(request)
      .pipe(
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
          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}<br \>Message: ${error.error.error}`;
          }

          if(error.status === 419) {
            this.authenticationService.timeoutAuthentication();
          }

          return throwError(() => errorMessage);
        })
      );
  }
}
