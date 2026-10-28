import {describe, expect, it, vi} from 'vitest';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscriber} from 'rxjs';
import {Unit} from 'src/app/api/models/doubtfire-model';
import {UnitService} from '../unit.service';

describe('UnitService', () => {
  it('keeps a detail request alive and reuses it after the first subscriber leaves', () => {
    const service = new UnitService(
      {} as HttpClient,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const unit = new Unit();
    unit.id = 42;

    let observer!: Subscriber<Unit>;
    let sourceSubscriptions = 0;
    let sourceUnsubscriptions = 0;
    const source: Observable<Unit> = new Observable((sourceObserver) => {
      observer = sourceObserver;
      sourceSubscriptions += 1;
      return () => {
        sourceUnsubscriptions += 1;
      };
    });
    const fetch = vi.spyOn(service, 'fetch').mockReturnValue(source);

    const firstSubscription = service.loadDetails(unit.id).subscribe();
    firstSubscription.unsubscribe();

    expect(sourceSubscriptions).toBe(1);
    expect(sourceUnsubscriptions).toBe(0);

    let loadedUnit!: Unit;
    service.loadDetails(unit.id).subscribe((result) => (loadedUnit = result));

    expect(sourceSubscriptions).toBe(1);
    expect(fetch).toHaveBeenCalledTimes(1);

    observer.next(unit);
    observer.complete();

    expect(loadedUnit).toBe(unit);
    expect(sourceUnsubscriptions).toBe(1);
  });
});
