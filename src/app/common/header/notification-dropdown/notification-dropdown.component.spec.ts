import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {NotificationActionsService} from 'src/app/notifications/notification-actions.service';
import {NotificationDropdownComponent} from './notification-dropdown.component';

describe('NotificationDropdownComponent', () => {
  let component: NotificationDropdownComponent;
  let fixture: ComponentFixture<NotificationDropdownComponent>;
  const getNotifications = vi.fn(() =>
    of({groups: [], page: 1, perPage: 5, total: 0, unreadCount: 0}),
  );
  const markAllRead = vi.fn(() => of({count: 1}));
  const openGroup = vi.fn();
  const navigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [NotificationDropdownComponent],
      providers: [
        {provide: NotificationActionsService, useValue: {open: openGroup}},
        {provide: Router, useValue: {navigate}},
        {
          provide: NotificationService,
          useValue: {
            startCountPolling: vi.fn(),
            stopCountPolling: vi.fn(),
            unreadCount$: of(0),
            getNotifications,
            markAllRead,
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

  it('delegates opening a notification to the notification actions service', () => {
    const group = {notificationIds: [1, 2]} as NotificationGroup;

    component.open(group);

    expect(openGroup).toHaveBeenCalledWith(group);
  });

  it('marks all notifications as read and clears the preview', () => {
    component.unreadCount = 2;
    component.groups = [{key: 'group'} as NotificationGroup];

    component.markAllRead();

    expect(markAllRead).toHaveBeenCalledOnce();
    expect(component.groups).toEqual([]);
    expect(component.unreadCount).toBe(0);
    expect(component.markingAllRead).toBe(false);
  });

  it('shows only the detail, since the task is already shown beside it', () => {
    const withTask = {
      task: {abbreviation: 'P4'},
      detail: 'Overseer assessment failed',
      summary: 'P4 - Overseer assessment failed',
    } as NotificationGroup;
    const withoutTask = {
      detail: '2 moderation notes',
      summary: 'Unit notification - 2 moderation notes',
    } as NotificationGroup;

    expect(component.summaryText(withTask)).toBe('Overseer assessment failed');
    expect(component.summaryText(withoutTask)).toBe('Unit notification - 2 moderation notes');
  });

  it('shows only the sender for communication emails', () => {
    const communicationEmail = {
      counts: {communication_email: 1},
      detail: 'Message from Charlotte Pierce',
      summary: 'FIT1045 Introduction to Programming - Message from Charlotte Pierce',
    } as NotificationGroup;

    expect(component.summaryText(communicationEmail)).toBe('Message from Charlotte Pierce');
  });
});
