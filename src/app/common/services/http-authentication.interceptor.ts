import { Injectable, Injector, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { currentUser, UnitStudentEnrolmentModalProvider } from 'src/app/ajs-upgraded-providers';
import API_URL from 'src/app/config/constants/apiURL';
import { Param } from '@uirouter/angular';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    @Inject(currentUser) private currentUser: any,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(API_URL) && this.currentUser.authenticationToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.currentUser.authenticationToken}`,
          'username' : this.currentUser.profile.username
        },
        })
    }
    return next.handle(request);
  }
}
