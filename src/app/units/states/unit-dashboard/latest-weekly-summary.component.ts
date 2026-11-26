import {AsyncPipe, DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, OnChanges, inject} from '@angular/core';
import {Observable, catchError, map, of, switchMap} from 'rxjs';
import {WeeklySummary} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';

@Component({
  selector: 'f-latest-weekly-summary',
  imports: [AsyncPipe, DatePipe],
  host: {class: 'block'},
  templateUrl: './latest-weekly-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatestWeeklySummaryComponent implements OnChanges {
  @Input({required: true}) unitId: number;
  @Input() viewAsUnitRoleId?: number;

  private readonly notificationService = inject(NotificationService);
  protected result$: Observable<{summary: WeeklySummary | null; unavailable: boolean}>;

  ngOnChanges(): void {
    const summary$ =
      this.viewAsUnitRoleId == null
        ? this.loadWeeklySummary(this.unitId)
        : this.notificationService.getStaffWeeklySummary(this.unitId, this.viewAsUnitRoleId);
    this.result$ = summary$.pipe(
      map((summary) => ({summary, unavailable: false})),
      catchError(() => of({summary: null, unavailable: true})),
    );
  }

  private loadWeeklySummary(unitId: number, page = 1): Observable<WeeklySummary | null> {
    return this.notificationService
      .getNotifications({unitId, kinds: ['weekly_summary'], state: 'all', page})
      .pipe(
        switchMap(({groups, perPage, total}) => {
          const summary = groups.find(
            (group) => group.weeklySummary?.audience === 'staff',
          )?.weeklySummary;
          if (summary || page * perPage >= total) {
            return of(summary ?? null);
          }
          return this.loadWeeklySummary(unitId, page + 1);
        }),
      );
  }
}
