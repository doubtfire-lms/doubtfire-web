import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {UserService} from 'src/app/api/services/user.service';
import LTI_API_URL from 'src/app/config/constants/ltiApiUrl';

@Injectable()
export class HttpAuthenticationInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(API_URL) || request.url.startsWith(LTI_API_URL)) {
      request = request.clone({
        setHeaders: {
          ...(this.userService.currentUser.authenticationToken && {
            'Auth-Token': this.userService.currentUser.authenticationToken,
            Username: this.userService.currentUser.username,
          }),
          ...(this.userService.currentUser.ltik && {
            Authorization: `Bearer ${this.userService.currentUser.ltik}`,
          }),
        },
      });
    }
    return next.handle(request);
  }
}
