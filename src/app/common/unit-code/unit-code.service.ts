import {Injectable} from '@angular/core';
import {Observable, interval, shareReplay} from 'rxjs';

// we have a service so that we can share the same interval observable among multiple subscribers
// simply, all unitCodes will tick over at the same time
@Injectable({
  providedIn: 'root',
})
export class UnitCodeService {
  private readonly interval$: Observable<number>;

  constructor() {
    // we use shareReplay to share the same interval observable among multiple subscribers
    this.interval$ = interval(3000).pipe(shareReplay({bufferSize: 1, refCount: true}));
  }

  getInterval(): Observable<number> {
    return this.interval$;
  }
}
