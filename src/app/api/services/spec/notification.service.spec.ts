import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {AuthenticationService} from '../authentication.service';
import {NotificationService} from '../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  let afterAuthCallback: ((result: boolean) => void) | undefined;

  beforeEach(() => {
    afterAuthCallback = undefined;
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        {
          provide: AuthenticationService,
          useValue: {
            afterAuthCall: vi.fn((callback: (result: boolean) => void) => {
              afterAuthCallback = callback;
            }),
          },
        },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.ngOnDestroy();
    httpMock.verify();
  });

  it('maps grouped notification responses', () => {
    let summary: string;

    service.getNotifications({state: 'unread'}).subscribe((page) => {
      summary = page.groups[0].summary;
      expect(page.unreadCount).toBe(1);
      expect(page.groups[0].projectId).toBe(42);
      expect(page.groups[0].task?.projectId).toBe(42);
      expect(page.groups[0].latestAt).toBeInstanceOf(Date);
      expect(page.groups[0].messageSubject).toBe('Important update');
      expect(page.groups[0].messageBody).toBe('Full message');
    });

    const request = httpMock.expectOne(
      (candidate) =>
        candidate.url.endsWith('/api/notifications') && candidate.params.get('state') === 'unread',
    );
    request.flush({
      groups: [
        {
          key: 'unread:task:9',
          notification_ids: [1, 2],
          tutor_note_notification_ids: [],
          unit: {id: 3, code: 'FIT1045', name: 'Programming'},
          project_id: 42,
          task: {
            id: 9,
            project_id: 42,
            task_definition_id: 7,
            abbreviation: 'P4',
            name: 'Loops',
            staff_view: false,
          },
          counts: {new_task_comment: 2},
          event_count: 2,
          severity: 'normal',
          read: false,
          latest_at: '2026-07-29T09:00:00Z',
          tutor_note_ids: [],
          message_subject: 'Important update',
          message_body: 'Full message',
          summary: 'P4 — 2 new comments',
        },
      ],
      page: 1,
      per_page: 25,
      total: 1,
      unread_count: 1,
    });

    expect(summary).toBe('P4 — 2 new comments');
  });

  it('marks only the supplied notification ids as read', () => {
    service.markRead([1, 2]).subscribe();

    const request = httpMock.expectOne((candidate) =>
      candidate.url.endsWith('/notifications/read'),
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({notification_ids: [1, 2]});
    request.flush({count: 2});

    const countRequest = httpMock.expectOne((candidate) =>
      candidate.url.endsWith('/notifications/unread_count'),
    );
    countRequest.flush({count: 0});
  });

  it('waits for authentication before polling the grouped unread count', () => {
    vi.useFakeTimers();
    let latestCount = 0;
    const subscription = service.unreadCount$.subscribe((count) => {
      latestCount = count;
    });

    service.startCountPolling();
    vi.advanceTimersByTime(0);
    httpMock.expectNone((candidate) => candidate.url.endsWith('/notifications/unread_count'));

    afterAuthCallback?.(true);
    vi.advanceTimersByTime(0);

    const initialRequest = httpMock.expectOne((candidate) =>
      candidate.url.endsWith('/notifications/unread_count'),
    );
    initialRequest.flush({count: 4});
    expect(latestCount).toBe(4);

    vi.advanceTimersByTime(60_000);
    const nextRequest = httpMock.expectOne((candidate) =>
      candidate.url.endsWith('/notifications/unread_count'),
    );
    nextRequest.flush({count: 2});
    expect(latestCount).toBe(2);

    service.stopCountPolling();
    vi.advanceTimersByTime(60_000);
    httpMock.expectNone((candidate) => candidate.url.endsWith('/notifications/unread_count'));

    subscription.unsubscribe();
    vi.useRealTimers();
  });

  it('does not start polling when authentication fails', () => {
    service.startCountPolling();

    afterAuthCallback?.(false);

    httpMock.expectNone((candidate) => candidate.url.endsWith('/notifications/unread_count'));
  });

  it('does not start delayed polling after polling has been stopped', () => {
    service.startCountPolling();
    service.stopCountPolling();

    afterAuthCallback?.(true);

    httpMock.expectNone((candidate) => candidate.url.endsWith('/notifications/unread_count'));
  });

  it('keeps a newer polling request when an older consumer stops during authentication', () => {
    vi.useFakeTimers();
    service.startCountPolling();
    service.startCountPolling();
    service.stopCountPolling();

    afterAuthCallback?.(true);
    vi.advanceTimersByTime(0);

    const request = httpMock.expectOne((candidate) =>
      candidate.url.endsWith('/notifications/unread_count'),
    );
    request.flush({count: 3});
    vi.useRealTimers();
  });
});
