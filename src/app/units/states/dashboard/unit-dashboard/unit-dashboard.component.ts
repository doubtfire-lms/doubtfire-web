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
  switchMap,
  takeUntil,
} from 'rxjs';
import {ProjectService, Task, TaskService, Unit} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';

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

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService,
    private alertService: AlertService,
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

          // TaskService maps inbox tasks to projects in the unit's student cache.
          return this.projectService.loadStudents(unit).pipe(
            switchMap(() => this.taskService.queryTasksForTaskInbox(unit, undefined, true)),
            catchError(() => {
              this.alertService.error('Error loading tutor dashboard.', 6000);
              return EMPTY;
            }),
            finalize(() => (this.loading = false)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((tasks) => this.calculateMetrics(tasks));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
