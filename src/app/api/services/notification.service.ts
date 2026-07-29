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
  NotificationPreference,
  NotificationQuery,
} from '../models/notification';

interface NotificationPageResponse {
  groups: Record<string, unknown>[];
  page: number;
  per_page: number;
  total: number;
  unread_count: number;
}

@Injectable()
export class NotificationService implements OnDestroy {
  private readonly unreadCountSubject: BehaviorSubject<number> = new BehaviorSubject(0);
  private pollingSubscription?: Subscription;

  public readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  public startCountPolling(): void {
    if (this.pollingSubscription) {
      return;
    }

    this.pollingSubscription = timer(0, 60_000)
      .pipe(
        switchMap(() =>
          this.httpClient
            .get<{count: number}>(`${API_URL}/notifications/unread_count`)
            .pipe(catchError(() => of({count: this.unreadCountSubject.value}))),
        ),
      )
      .subscribe(({count}) => this.unreadCountSubject.next(count));
  }

  public stopCountPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
  }

  public refreshUnreadCount(): void {
    this.httpClient.get<{count: number}>(`${API_URL}/notifications/unread_count`).subscribe({
      next: ({count}) => this.unreadCountSubject.next(count),
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
      })),
      tap((page) => this.unreadCountSubject.next(page.unreadCount)),
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

  public getPreferences(): Observable<NotificationPreference[]> {
    return this.httpClient
      .get<Record<string, unknown>[]>(`${API_URL}/notification_preferences`)
      .pipe(map((preferences) => preferences.map((preference) => this.mapPreference(preference))));
  }

  public updatePreference(preference: NotificationPreference): Observable<NotificationPreference> {
    return this.httpClient
      .put<Record<string, unknown>>(`${API_URL}/notification_preferences/${preference.unit.id}`, {
        email_categories: preference.emailCategories,
        email_frequency: preference.emailFrequency,
        email_time: preference.emailTime,
        email_weekday: preference.emailWeekday,
        timezone: preference.timezone,
      })
      .pipe(map((response) => this.mapPreference(response)));
  }

  public ngOnDestroy(): void {
    this.stopCountPolling();
  }

  private mapGroup(data: Record<string, unknown>): NotificationGroup {
    const task = data['task'] as Record<string, unknown> | null;
    const unit = data['unit'] as Record<string, unknown>;

    return {
      key: data['key'] as string,
      notificationIds: data['notification_ids'] as number[],
      tutorNoteNotificationIds: data['tutor_note_notification_ids'] as number[],
      unit: {
        id: unit['id'] as number,
        code: unit['code'] as string,
        name: unit['name'] as string,
      },
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
      counts: data['counts'] as Partial<Record<NotificationKind, number>>,
      eventCount: data['event_count'] as number,
      latestStatus: data['latest_status'] as NotificationGroup['latestStatus'],
      severity: data['severity'] as NotificationGroup['severity'],
      read: data['read'] as boolean,
      readAt: data['read_at'] ? new Date(data['read_at'] as string) : undefined,
      latestAt: new Date(data['latest_at'] as string),
      tutorNoteIds: data['tutor_note_ids'] as number[],
      tutorNoteUnitRoleId: data['tutor_note_unit_role_id'] as number | undefined,
      summary: data['summary'] as string,
    };
  }

  private mapPreference(data: Record<string, unknown>): NotificationPreference {
    const unit = data['unit'] as Record<string, unknown>;

    return {
      id: data['id'] as number,
      unit: {
        id: unit['id'] as number,
        code: unit['code'] as string,
        name: unit['name'] as string,
      },
      emailCategories: data['email_categories'] as NotificationKind[],
      emailFrequency: data['email_frequency'] as NotificationPreference['emailFrequency'],
      emailTime: data['email_time'] as string,
      emailWeekday: data['email_weekday'] as number,
      timezone: data['timezone'] as string,
      nextDigestAt: data['next_digest_at'] ? new Date(data['next_digest_at'] as string) : undefined,
      lastDigestAt: data['last_digest_at'] ? new Date(data['last_digest_at'] as string) : undefined,
    };
  }
}
