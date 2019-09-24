import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { alertService, User } from 'src/app/ajs-upgraded-providers';

@Injectable()
export class UserSettingsDialogService {
  constructor(@Inject(User) private user: any, @Inject(alertService) private alerts: any, ) { }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  queryUsers(): Observable<Object[]> {
    return Observable.create(
      observer => this.user.query((response: any) => { observer.next(response); }, (error: any) => { this.handleError(error); })
    );
  }

  createUser(newUser: any): Observable<Object> {
    return Observable.create(
      observer => this.user.create(newUser, (response: any) => { observer.next(response); }, (error: any) => { this.handleError(error); })
    );
  }

  updateUser(user: any): Observable<Object> {
    return Observable.create(
      observer => this.user.update(
        { id: user.id, user: user },
        (response: any) => { observer.next(response); },
        (error: any) => { this.handleError(error);
      })
    );
  }
}
