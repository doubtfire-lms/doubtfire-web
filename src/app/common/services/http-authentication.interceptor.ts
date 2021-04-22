import { Injectable, Injector, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import API_URL from 'src/app/config/constants/apiURL';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(@Inject(currentUser) private CurrentUser: any) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(API_URL) && this.CurrentUser.authenticationToken) {
      request = request.clone({
        setHeaders: {
          'Auth-Token': `Bearer ${this.CurrentUser.authenticationToken}`,
          Username: `Bearer ${this.CurrentUser.username}`,
        },
      });
    }
    return next.handle(request);
  }
}
