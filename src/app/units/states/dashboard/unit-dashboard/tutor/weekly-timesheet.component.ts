import {addDays, isSameDay} from 'date-fns';
import {AsyncPipe, DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, OnChanges, inject} from '@angular/core';
import {ReplaySubject, catchError, map, of, startWith, switchMap} from 'rxjs';
import {MarkingSession} from 'src/app/api/models/marking-session';
import {Unit} from 'src/app/api/models/unit';
import {User} from 'src/app/api/models/user/user';
import {UserService} from 'src/app/api/services/user.service';
import {calendarDate, formatDuration, mondayOf, weekLabel} from '../timesheet-week';

const weekday = new Intl.DateTimeFormat('en-AU', {weekday: 'short'});

interface TimesheetDay {
  date: Date;
  label: string;
  sessions: MarkingSession[];
  minutes: number;
  assessments: number;
}

@Component({
  selector: 'f-weekly-timesheet',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './weekly-timesheet.component.html',
  host: {class: 'block'},
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyTimesheetComponent implements OnChanges {
  @Input({required: true}) unit: Unit;

  private readonly userService = inject(UserService);
  private readonly selection$: ReplaySubject<{unit: Unit; monday: Date}> = new ReplaySubject(1);

  public get browserTimezone(): string {
    return User.browserTimezone;
  }

  public monday = mondayOf(new Date());
  public openDay: TimesheetDay | null = null;

  public readonly timesheet$ = this.selection$.pipe(
    switchMap(({unit, monday}) =>
      unit.getUserMarkingSessions(monday, addDays(monday, 6), this.browserTimezone).pipe(
        map((sessions) => this.summariseWeek(monday, sessions)),
        catchError(() => of({status: 'error' as const})),
        startWith({status: 'loading' as const}),
      ),
    ),
  );

  public ngOnChanges(): void {
    this.selectWeek(mondayOf(new Date()));
  }

  public get weekLabel(): string {
    return weekLabel(this.monday);
  }

  public get isCurrentWeek(): boolean {
    return this.monday >= mondayOf(new Date());
  }

  public get canGoBack(): boolean {
    const startDate = this.unit.startDate;
    return !!startDate && !Number.isNaN(startDate.getTime()) && this.monday > mondayOf(startDate);
  }

  public changeWeek(direction: -1 | 1): void {
    if (direction === -1 ? this.canGoBack : !this.isCurrentWeek) {
      this.selectWeek(mondayOf(addDays(this.monday, direction * 7)));
    }
  }

  public toggleDay(day: TimesheetDay): void {
    this.openDay = this.openDay === day ? null : day;
  }

  public readonly formatDuration = formatDuration;

  public formatDate(day: Date): string {
    return calendarDate.format(day);
  }

  private selectWeek(monday: Date): void {
    this.monday = monday;
    this.openDay = null;
    this.selection$.next({unit: this.unit, monday});
  }

  private summariseWeek(monday: Date, sessions: MarkingSession[]) {
    const days = Array.from({length: 7}, (_, index): TimesheetDay => {
      const date = addDays(monday, index);
      return {date, label: weekday.format(date), sessions: [], minutes: 0, assessments: 0};
    });
    const userId = this.userService.currentUser.id;
    const ownSessions = sessions
      .filter(
        (session) =>
          session.user?.id === userId && !session.duringTutorial && session.durationMinutes >= 1,
      )
      .sort(
        (first, second) =>
          new Date(first.startTime).getTime() - new Date(second.startTime).getTime(),
      );

    for (const session of ownSessions) {
      const day = days.find(({date}) => isSameDay(date, session.startTime));
      if (day) {
        day.sessions.push(session);
        day.minutes += session.durationMinutes;
        day.assessments += session.assessments;
      }
    }

    const minutes = days.reduce((total, day) => total + day.minutes, 0);
    const assessments = days.reduce((total, day) => total + day.assessments, 0);
    if (minutes === 0 && assessments === 0) {
      return {status: 'empty' as const};
    }

    return {status: 'ready' as const, days, minutes, assessments};
  }
}
