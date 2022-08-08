import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import API_URL from 'src/app/config/constants/apiURL';
import { UserService } from 'src/app/api/services/user.service';

@Injectable()
export class HttpAuthenticationInterceptor implements HttpInterceptor {
  constructor(
    private userService: UserService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(API_URL) && this.userService.currentUser.authenticationToken) {
      request = request.clone({
        setHeaders: {
          'Auth-Token': `${this.userService.currentUser.authenticationToken}`,
          Username: `${this.userService.currentUser.username}`,
        },
      });
    }
    return next.handle(request);
  }
}
