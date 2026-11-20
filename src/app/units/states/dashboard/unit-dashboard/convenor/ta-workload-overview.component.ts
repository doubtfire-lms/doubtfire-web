import {addDays} from 'date-fns';
import {AsyncPipe, DecimalPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {ReplaySubject, catchError, map, of, startWith, switchMap} from 'rxjs';
import {Unit, User} from 'src/app/api/models/doubtfire-model';
import {formatDuration, mondayOf, weekLabel} from '../timesheet-week';

@Component({
  selector: 'f-ta-workload-overview',
  imports: [AsyncPipe, DecimalPipe],
  templateUrl: './ta-workload-overview.component.html',
  host: {class: 'block'},
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaWorkloadOverviewComponent implements OnChanges {
  @Input({required: true}) unit: Unit;

  protected monday: Date;
  protected readonly weekLabel = weekLabel;
  protected readonly formatDuration = formatDuration;
  private readonly selection$: ReplaySubject<Date> = new ReplaySubject(1);

  protected readonly overview$ = this.selection$.pipe(
    switchMap((monday) =>
      this.unit.getUserMarkingSessions(monday, addDays(monday, 6), User.browserTimezone).pipe(
        map((sessions) => {
          const tutors = this.unit.staff.filter(
            (staff) => staff.role === 'Tutor' && !staff.observerOnly,
          );
          const rows = tutors.map(({user}) => ({user, minutes: 0, students: new Set<number>()}));
          const byUser = new Map(rows.map((row) => [row.user.id, row]));
          for (const session of sessions) {
            const row = byUser.get(session.user?.id);
            if (row && !session.duringTutorial) {
              row.minutes += session.durationMinutes;
              session.assessedProjectIds?.forEach((id) => row.students.add(id));
            }
          }
          rows.sort((a, b) => a.user.name.localeCompare(b.user.name));
          return {status: 'ready' as const, rows};
        }),
        catchError(() => of({status: 'error' as const})),
        startWith({status: 'loading' as const}),
      ),
    ),
  );

  ngOnChanges(): void {
    this.monday = mondayOf(new Date());
    this.selection$.next(this.monday);
  }

  protected get canGoBack(): boolean {
    return !!this.unit.startDate && this.monday > mondayOf(this.unit.startDate);
  }

  protected get isCurrentWeek(): boolean {
    return this.monday >= mondayOf(new Date());
  }

  protected changeWeek(direction: -1 | 1): void {
    if (direction === -1 ? this.canGoBack : !this.isCurrentWeek) {
      this.monday = addDays(this.monday, direction * 7);
      this.selection$.next(this.monday);
    }
  }
}
