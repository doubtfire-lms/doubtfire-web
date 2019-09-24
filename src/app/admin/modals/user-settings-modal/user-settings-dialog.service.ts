import { Injectable, Inject } from '@angular/core';
import { User } from 'src/app/ajs-upgraded-providers';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class UserSettingsDialogService {
  constructor(@Inject(User) private user: any, ) { }

  createUser(newUser: any): Observable<Object> {
    return Observable.create(
      observer => this.user.create(newUser, (response: any) => { observer.next(response) }, (error: any) => { })
    )
  }

  updateUser(user: any): Observable<Object> {
    return Observable.create(
      observer => this.user.update({id: user.id, user: user}, (response: any) => { observer.next(response) }, (error: any) => { console.log(error) })
    )
  }
}


// this.ts.postDiscussionReply(task, taskCommentID, audio, () => { }, (error: any) => this.handleError(error));