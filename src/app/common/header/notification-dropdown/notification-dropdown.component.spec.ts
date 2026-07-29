import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {NotificationDropdownComponent} from './notification-dropdown.component';

describe('NotificationDropdownComponent', () => {
  let component: NotificationDropdownComponent;
  let fixture: ComponentFixture<NotificationDropdownComponent>;
  const getNotifications = vi.fn(() =>
    of({groups: [], page: 1, perPage: 5, total: 0, unreadCount: 0}),
  );
  const markRead = vi.fn(() => of({count: 1}));
  const navigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [NotificationDropdownComponent],
      providers: [
        {provide: Router, useValue: {navigate}},
        {
          provide: NotificationService,
          useValue: {
            startCountPolling: vi.fn(),
            stopCountPolling: vi.fn(),
            unreadCount$: of(0),
            getNotifications,
            markRead,
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(NotificationDropdownComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(NotificationDropdownComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads five unread groups for the notification preview', () => {
    component.load();

    expect(getNotifications).toHaveBeenCalledWith({state: 'unread', page: 1, perPage: 5});
    expect(component.groups).toEqual([]);
    expect(component.loading).toBe(false);
  });

  it('marks a task notification read and opens the task', () => {
    component.open({
      notificationIds: [11, 12],
      task: {
        projectId: 7,
        abbreviation: 'P4',
        staffView: false,
      },
    } as NotificationGroup);

    expect(markRead).toHaveBeenCalledWith([11, 12]);
    expect(navigate).toHaveBeenCalledWith(['/projects', 7, 'dashboard', 'P4']);
  });

  it('uses the task badge as the subject while retaining status text', () => {
    const text = component.summaryText({
      summary: 'P4 — 2 new comments and status changed to Fix and resubmit',
      task: {abbreviation: 'P4'},
    } as NotificationGroup);

    expect(text).toBe('2 new comments and status changed to Fix and resubmit');
  });
});
