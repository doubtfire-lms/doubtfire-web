import { Injectable, Inject } from '@angular/core';
import {
  User,
  analyticsService,
  alertService,
  currentUser,
  auth
} from 'src/app/ajs-upgraded-providers';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @Inject(User) private user: any,
    @Inject(alertService) private alerts: any,
    @Inject(currentUser) private currentUser: any,
    @Inject(auth) private auth: any,
    @Inject(analyticsService) private analyticsService: any,
  ) {}

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  create(newUser: any): Observable<Object> {
    return Observable.create(observer =>
      this.user.create(
        newUser,
        (response: any) => {
          observer.next(response);
        },
        (error: any) => {
          this.handleError(error);
        }
      )
    );
  }

  update(user: any): Observable<Object> {
    return Observable.create(observer =>
      this.user.update(
        { id: user.id, user: user },
        (response: any) => {
          observer.next(response);
        },
        (error: any) => {
          this.handleError(error);
        }
      )
    );
  }

  save(user: any) {
    user.name = `${user.first_name} ${user.last_name}`;
    if (user === this.currentUser.profile) {
      this.auth.saveCurrentUser();
      if (user.opt_in_to_research) {
        this.analyticsService.event(
          'Doubtfire Analytics',
          'User opted in research'
        );
      }
    }
  }
}
