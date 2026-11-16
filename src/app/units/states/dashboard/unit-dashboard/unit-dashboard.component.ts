import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {
  EMPTY,
  Subject,
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  merge,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {ProjectService, Task, TaskService, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';

interface DashboardQueue {
  path: 'moderation' | 'overflow';
  title: string;
  role: string;
  icon: string;
  count: number | 'Unavailable' | null;
}

@Component({
  imports: [MatIconModule, RouterLink],
  selector: 'f-unit-dashboard',
  host: {
    class:
      'box-border flex min-h-[calc(100dvh-160px)] items-center justify-center px-4 py-6 sm:px-6 sm:py-8',
  },
  styleUrl: './unit-dashboard.component.css',
  templateUrl: './unit-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class UnitDashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();

  public loading = true;
  public readyForFeedbackCount: number | null = null;
  public needsHelpCount: number | null = null;
  public feedbackOverdueCount: number | null = null;
  public oldestSubmissionAgeDays: number | null = null;
  public unreadMessagesCount: number | null = null;
  public unitRole: string | null = null;
  public queues: DashboardQueue[] = [];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService,
    private alertService: AlertService,
    private globalStateService: GlobalStateService,
  ) {}

  ngOnInit(): void {
    this.route.parent.data
      .pipe(
        map((data) => data.unit as Unit),
        filter((unit): unit is Unit => !!unit),
        distinctUntilChanged((previous, current) => previous.id === current.id),
        switchMap((unit) => {
          this.loading = true;
          this.readyForFeedbackCount = null;
          this.needsHelpCount = null;
          this.feedbackOverdueCount = null;
          this.oldestSubmissionAgeDays = null;
          this.unreadMessagesCount = null;
          this.configureRolesAndQueues(unit);

          // TaskService maps queue and inbox tasks to projects in the unit's student cache.
          return this.projectService.loadStudents(unit).pipe(
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
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configureRolesAndQueues(unit: Unit): void {
    const entity = this.globalStateService.currentViewAndEntitySubject$.value?.entity;
    const role = entity instanceof UnitRole && entity.unit.id === unit.id ? entity : null;
    this.unitRole = role?.role ?? null;
    this.queues = [];

    if (role?.role === 'Convenor' || (role?.id && unit.staff.some((s) => s.mentorId === role.id))) {
      this.queues.push({
        path: 'moderation',
        title: 'Moderation queue',
        role: 'Moderator',
        icon: 'rate_review',
        count: null,
      });
    }

    if (role && unit.staff.find((s) => s.id === role.id)?.canMarkOverflowTasks) {
      this.queues.push({
        path: 'overflow',
        title: 'Overflow queue',
        role: 'Overflow tutor',
        icon: 'more_time',
        count: null,
      });
    }
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
