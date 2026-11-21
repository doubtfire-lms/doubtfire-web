import {DatePipe} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {
  EMPTY,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  finalize,
  map,
  merge,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {ProjectService, Task, TaskService, Unit} from 'src/app/api/models/doubtfire-model';
import {WeeklySummary} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DashboardQueue} from '../dashboard-queue';
import {WeeklyTimesheetComponent} from './weekly-timesheet.component';

@Component({
  selector: 'f-tutor-dashboard',
  imports: [DatePipe, MatIconModule, RouterLink, WeeklyTimesheetComponent],
  host: {class: 'block'},
  templateUrl: './tutor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TutorComponent implements OnChanges, OnInit, OnDestroy {
  @Input({required: true}) unit: Unit;
  @Input({required: true}) dashboardQueues: readonly DashboardQueue[];
  @Input({required: true}) showTimesheet: boolean;

  private readonly context$: ReplaySubject<{unit: Unit; queues: readonly DashboardQueue[]}> =
    new ReplaySubject(1);
  private readonly destroy$: Subject<void> = new Subject();

  public loading = true;
  public readyForFeedbackCount: number | null = null;
  public needsHelpCount: number | null = null;
  public feedbackOverdueCount: number | null = null;
  public oldestSubmissionAgeDays: number | null = null;
  public unreadMessagesCount: number | null = null;
  public queues: (DashboardQueue & {count: number | 'Unavailable' | null})[] = [];
  public weeklySummary: WeeklySummary | null = null;
  public weeklySummaryLoading = true;
  public weeklySummaryUnavailable = false;

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private alertService: AlertService,
    private notificationService: NotificationService,
  ) {}

  ngOnChanges(): void {
    this.context$.next({unit: this.unit, queues: this.dashboardQueues});
  }

  ngOnInit(): void {
    this.context$
      .pipe(
        switchMap(({unit, queues}) => {
          this.loading = true;
          this.readyForFeedbackCount = null;
          this.needsHelpCount = null;
          this.feedbackOverdueCount = null;
          this.oldestSubmissionAgeDays = null;
          this.unreadMessagesCount = null;
          this.weeklySummary = null;
          this.weeklySummaryLoading = true;
          this.weeklySummaryUnavailable = false;
          this.queues = queues.map((queue) => ({...queue, count: null}));

          const weeklySummary$ = this.loadWeeklySummary(unit.id).pipe(
            tap((summary) => (this.weeklySummary = summary)),
            catchError(() => {
              this.weeklySummaryUnavailable = true;
              return EMPTY;
            }),
            finalize(() => (this.weeklySummaryLoading = false)),
          );

          // TaskService maps queue and inbox tasks to projects in the unit's student cache.
          const workload$ = this.projectService.loadStudents(unit).pipe(
            switchMap(() => {
              const inbox$ = this.taskService.queryTasksForTaskInbox(unit, undefined, true).pipe(
                tap((tasks) => this.calculateMetrics(tasks)),
                catchError(() => {
                  this.alertService.error('Error loading tutor dashboard.', 6000);
                  return EMPTY;
                }),
              );
              const queues$ = this.queues.map((queue) => {
                const tasks$ =
                  queue.path === 'moderation'
                    ? this.taskService.queryTasksForMentorModeration(unit)
                    : this.taskService.queryTasksForOverflow(unit);

                return tasks$.pipe(
                  map((tasks) => tasks.length),
                  catchError(() => of('Unavailable' as const)),
                  tap((count) => (queue.count = count)),
                );
              });
              return merge(inbox$, ...queues$);
            }),
            catchError(() => {
              this.queues.forEach((queue) => (queue.count = 'Unavailable'));
              this.alertService.error('Error loading tutor dashboard.', 6000);
              return EMPTY;
            }),
            finalize(() => (this.loading = false)),
          );
          return merge(workload$, weeklySummary$);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private calculateMetrics(tasks: Task[]): void {
    let readyForFeedback = 0;
    let needsHelp = 0;
    let feedbackOverdue = 0;
    let unreadMessages = 0;
    let oldestSubmissionTime = Infinity;
    let oldestSubmissionAgeDays: number | null = null;
    const now = Date.now();

    tasks.forEach((task) => {
      if (task.status === 'ready_for_feedback') {
        readyForFeedback++;

        if (task.submissionDate) {
          // Match the inbox's feedback age, including teaching-break pauses.
          const ageDays = task.daysSinceSubmission(now);
          if (ageDays >= task.unit.feedbackOverflowThresholdDays) {
            feedbackOverdue++;
          }

          const submissionTime = task.submissionDate.getTime();
          if (submissionTime < oldestSubmissionTime) {
            oldestSubmissionTime = submissionTime;
            oldestSubmissionAgeDays = ageDays;
          }
        }
      }

      if (task.status === 'need_help') {
        needsHelp++;
      }

      unreadMessages += task.numNewComments ?? 0;
    });

    this.readyForFeedbackCount = readyForFeedback;
    this.needsHelpCount = needsHelp;
    this.feedbackOverdueCount = feedbackOverdue;
    this.oldestSubmissionAgeDays = oldestSubmissionAgeDays;
    this.unreadMessagesCount = unreadMessages;
  }
}
