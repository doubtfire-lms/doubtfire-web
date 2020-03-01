import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ServiceWorkerRegistrationService {
  private signInComplete: Subject<boolean>;

  constructor() {
    this.signInComplete = new Subject<boolean>();
  }

  public getSignedInObervable(): Observable<boolean> {
    return this.signInComplete.asObservable();
  }

  public signedIn(): void {
    this.signInComplete.next(true);
  }
}
