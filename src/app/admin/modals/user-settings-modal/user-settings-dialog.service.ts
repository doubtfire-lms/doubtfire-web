import { Injectable, Inject } from '@angular/core';
import { User, alertService } from 'src/app/ajs-upgraded-providers';
import { Observable } from 'rxjs';

@Injectable()
export class UserSettingsDialogService {
  constructor(@Inject(User) private user: any, @Inject(alertService) private alerts: any, ) { }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  createUser(newUser: any): Observable<Object> {
    return Observable.create(
      observer => this.user.create(newUser, (response: any) => { observer.next(response) }, (error: any) => { this.handleError(error) })
    )
  }

  updateUser(user: any): Observable<Object> {
    return Observable.create(
      observer => this.user.update({ id: user.id, user: user }, (response: any) => { observer.next(response) }, (error: any) => { this.handleError(error) })
    )
  }
}