import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable, OnDestroy} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  map,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {
  NotificationGroup,
  NotificationKind,
  NotificationPage,
  NotificationQuery,
  WeeklySummary,
  WeeklySummaryTask,
  WeeklySummaryTutorialStream,
} from '../models/notification';
import {AuthenticationService} from './authentication.service';

interface NotificationPageResponse {
  groups: Record<string, unknown>[];
  page: number;
  per_page: number;
  total: number;
  unread_count: number;
  unread_counts_by_unit: Record<string, number>;
}

interface NotificationCountResponse {
  count: number;
  unread_counts_by_unit?: Record<string, number>;
}

@Injectable()
export class NotificationService implements OnDestroy {
  private readonly unreadCountSubject: BehaviorSubject<number> = new BehaviorSubject(0);
  private readonly unreadCountsByUnitSubject: BehaviorSubject<Record<number, number>> =
    new BehaviorSubject<Record<number, number>>({});
  private pollingSubscription?: Subscription;
  private pollingConsumers = 0;
  private waitingForAuthentication = false;

  public readonly unreadCount$ = this.unreadCountSubject.asObservable();
  public readonly unreadCountsByUnit$ = this.unreadCountsByUnitSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private authenticationService: AuthenticationService,
  ) {}

  public startCountPolling(): void {
    this.pollingConsumers += 1;
    if (this.pollingSubscription) {
      return;
    }

    // The dropdown is created once the header is shown after sign in, so the user
    // is usually already authenticated and we can fetch the count straight away.
    if (this.authenticationService.isAuthenticated()) {
      this.waitingForAuthentication = false;
      this.beginCountPolling();
      return;
    }

    if (this.waitingForAuthentication) {
      return;
    }

    this.waitingForAuthentication = true;
    this.authenticationService.afterAuthCall((result) => {
      this.waitingForAuthentication = false;
      if (result && this.pollingConsumers > 0 && !this.pollingSubscription) {
        this.beginCountPolling();
      }
    });
  }

  private beginCountPolling(): void {
    this.pollingSubscription = timer(0, 60_000)
      .pipe(
        switchMap(() =>
          this.httpClient
            .get<NotificationCountResponse>(`${API_URL}/notifications/unread_count`)
            .pipe(
              catchError(() =>
                of({
                  count: this.unreadCountSubject.value,
                }),
              ),
            ),
        ),
      )
      .subscribe((response) => this.updateUnreadCounts(response));
  }

  public stopCountPolling(): void {
    this.pollingConsumers = Math.max(0, this.pollingConsumers - 1);
    if (this.pollingConsumers > 0) {
      return;
    }

    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
    // Any pending wait belongs to a sign in attempt that is no longer relevant -
    // the authentication service replaces its completion subject on sign out, so
    // the pending callback may never run.
    this.waitingForAuthentication = false;
  }

  public refreshUnreadCount(): void {
    this.httpClient
      .get<NotificationCountResponse>(`${API_URL}/notifications/unread_count`)
      .subscribe({
        next: (response) => this.updateUnreadCounts(response),
        error: () => undefined,
      });
  }

  public getNotifications(query: NotificationQuery = {}): Observable<NotificationPage> {
    let params = new HttpParams()
      .set('state', query.state ?? 'all')
      .set('page', query.page ?? 1)
      .set('per_page', query.perPage ?? 25);

    if (query.unitId) {
      params = params.set('unit_id', query.unitId);
    }
    if (query.query) {
      params = params.set('query', query.query);
    }
    for (const kind of query.kinds ?? []) {
      params = params.append('kinds[]', kind);
    }

    return this.httpClient.get<NotificationPageResponse>(`${API_URL}/notifications`, {params}).pipe(
      map((response) => ({
        groups: response.groups.map((group) => this.mapGroup(group)),
        page: response.page,
        perPage: response.per_page,
        total: response.total,
        unreadCount: response.unread_count,
        unreadCountsByUnit: this.mapUnreadCountsByUnit(response.unread_counts_by_unit),
      })),
      tap((page) => {
        this.unreadCountSubject.next(page.unreadCount);
        this.unreadCountsByUnitSubject.next(page.unreadCountsByUnit);
      }),
    );
  }

  public markRead(notificationIds: number[]): Observable<{count: number}> {
    return this.httpClient
      .put<{count: number}>(`${API_URL}/notifications/read`, {
        notification_ids: notificationIds,
      })
      .pipe(tap(() => this.refreshUnreadCount()));
  }

  public markAllRead(unitId?: number): Observable<{count: number}> {
    return this.httpClient
      .put<{count: number}>(`${API_URL}/notifications/read_all`, {
        unit_id: unitId,
      })
      .pipe(tap(() => this.refreshUnreadCount()));
  }

  public ngOnDestroy(): void {
    this.stopCountPolling();
  }

  private updateUnreadCounts(response: NotificationCountResponse): void {
    this.unreadCountSubject.next(response.count);
    if (response.unread_counts_by_unit) {
      this.unreadCountsByUnitSubject.next(
        this.mapUnreadCountsByUnit(response.unread_counts_by_unit),
      );
    }
  }

  private mapUnreadCountsByUnit(counts: Record<string, number>): Record<number, number> {
    return Object.fromEntries(
      Object.entries(counts ?? {}).map(([unitId, count]) => [Number(unitId), count]),
    );
  }

  private mapGroup(data: Record<string, unknown>): NotificationGroup {
    const task = data['task'] as Record<string, unknown> | null;
    const unit = data['unit'] as Record<string, unknown>;
    const destination = data['destination'] as Record<string, unknown> | null;

    return {
      key: data['key'] as string,
      notificationIds: data['notification_ids'] as number[],
      tutorNoteNotificationIds: data['tutor_note_notification_ids'] as number[],
      unit: {
        id: unit['id'] as number,
        code: unit['code'] as string,
        name: unit['name'] as string,
      },
      projectId: data['project_id'] as number | undefined,
      task: task
        ? {
            id: task['id'] as number,
            projectId: task['project_id'] as number,
            taskDefinitionId: task['task_definition_id'] as number,
            abbreviation: task['abbreviation'] as string,
            name: task['name'] as string,
            staffView: task['staff_view'] as boolean,
            studentName: task['student_name'] as string | undefined,
          }
        : undefined,
      destination: destination
        ? {
            type: destination['type'] as 'unit_inbox',
            unitId: destination['unit_id'] as number,
          }
        : undefined,
      counts: data['counts'] as Partial<Record<NotificationKind, number>>,
      eventCount: data['event_count'] as number,
      latestStatus: data['latest_status'] as NotificationGroup['latestStatus'],
      severity: data['severity'] as NotificationGroup['severity'],
      read: data['read'] as boolean,
      readAt: data['read_at'] ? new Date(data['read_at'] as string) : undefined,
      latestAt: new Date(data['latest_at'] as string),
      tutorNoteIds: data['tutor_note_ids'] as number[],
      tutorNoteUnitRoleId: data['tutor_note_unit_role_id'] as number | undefined,
      tutorNoteOnTaskTutor: data['tutor_note_on_task_tutor'] as boolean,
      overseerAssessmentId: data['overseer_assessment_id'] as number | undefined,
      messageSubject: data['message_subject'] as string | undefined,
      messageBody: data['message_body'] as string | undefined,
      weeklySummary: this.mapWeeklySummary(
        data['weekly_summary'] as Record<string, unknown> | undefined,
      ),
      detail: data['detail'] as string,
      summary: data['summary'] as string,
    };
  }

  private mapWeeklySummary(data?: Record<string, unknown>): WeeklySummary | undefined {
    if (!data) {
      return undefined;
    }

    return {
      audience: data['audience'] as WeeklySummary['audience'],
      weekStart: data['week_start'] as string,
      weekEnd: data['week_end'] as string,
      unitComments: data['unit_comments'] as number,
      unitTaskActivity: data['unit_task_activity'] as number,
      sentComments: data['sent_comments'] as number,
      receivedComments: data['received_comments'] as number,
      taskActivity: data['task_activity'] as number | undefined,
      studentTaskActivity: data['student_task_activity'] as number,
      tutorAllocated: data['tutor_allocated'] as boolean | undefined,
      didRevertToPass: data['did_revert_to_pass'] as boolean | undefined,
      portfolioExists: data['portfolio_exists'] as boolean | undefined,
      topTasks: ((data['top_tasks'] as Record<string, unknown>[] | undefined) ?? []).map(
        (task) => ({
          abbreviation: task['abbreviation'] as string,
          name: task['name'] as string,
          reason: task['reason'] as string,
          reasonLabel: task['reason_label'] as string,
          status: task['status'] as WeeklySummaryTask['status'],
        }),
      ),
      hasStudents: data['has_students'] as boolean | undefined,
      isConvenor: data['is_convenor'] as boolean | undefined,
      assessedTasks: data['assessed_tasks'] as number | undefined,
      discussedTasks: data['discussed_tasks'] as number | undefined,
      awaitingFeedback: data['awaiting_feedback'] as number | undefined,
      oldestTaskDays: data['oldest_task_days'] as number | undefined,
      revertedStudents: (data['reverted_students'] as string[] | undefined) ?? [],
      revertedStudentCount: data['reverted_student_count'] as number | undefined,
      tutorialStreams: (
        (data['tutorial_streams'] as Record<string, unknown>[] | undefined) ?? []
      ).map((stream) => this.mapTutorialStream(stream)),
    };
  }

  private mapTutorialStream(data: Record<string, unknown>): WeeklySummaryTutorialStream {
    return {
      name: data['name'] as string,
      unallocatedStudents: data['unallocated_students'] as number,
      tutors: ((data['tutors'] as Record<string, unknown>[] | undefined) ?? []).map((tutor) => ({
        tutorName: tutor['tutor_name'] as string,
        students: tutor['students'] as number,
        totalAssessments: tutor['total_assessments'] as number,
        weeklyAssessments: tutor['weekly_assessments'] as number,
        totalComments: tutor['total_comments'] as number,
        weeklyComments: tutor['weekly_comments'] as number,
        awaitingFeedback: tutor['awaiting_feedback'] as number,
        oldestTaskDays: tutor['oldest_task_days'] as number,
        totalDiscussions: tutor['total_discussions'] as number,
        weeklyDiscussions: tutor['weekly_discussions'] as number,
      })),
    };
  }
}
