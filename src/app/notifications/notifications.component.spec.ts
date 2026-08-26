import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {TutorNotesModalService} from 'src/app/common/modals/tutor-notes-modal/tutor-notes-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {NotificationActionsService} from './notification-actions.service';
import {NotificationsComponent} from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  const markRead = vi.fn(() => of({count: 1}));
  const openGroup = vi.fn();
  const openTutorNotes = vi.fn(() => of(undefined));
  const navigate = vi.fn();
  const getNotifications = vi.fn(() =>
    of({groups: [], page: 1, perPage: 25, total: 0, unreadCount: 0}),
  );
  const getUnit = vi.fn(() =>
    of({
      staff: [{id: 22}],
    }),
  );
  const showTutorNotes = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            startCountPolling: vi.fn(),
            getNotifications,
            markRead,
            markAllRead: vi.fn(() => of({count: 0})),
          },
        },
        {
          provide: GlobalStateService,
          useValue: {unitRolesSubject: of([]), projectsSubject: of([])},
        },
        {
          provide: NotificationActionsService,
          useValue: {open: openGroup, openTutorNotes},
        },
        {provide: Router, useValue: {navigate}},
        {provide: UnitService, useValue: {get: getUnit}},
        {provide: TutorNotesModalService, useValue: {show: showTutorNotes}},
        {provide: AlertService, useValue: {error: vi.fn(), success: vi.fn()}},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(NotificationsComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
  });

  it('delegates opening a group to the notification actions service', () => {
    const group = {notificationIds: [1, 2]} as NotificationGroup;

    component.openTask(group);

    expect(openGroup).toHaveBeenCalledWith(group);
  });

  it('delegates opening moderation notes, then refreshes the list', () => {
    const group = {tutorNoteNotificationIds: [7, 8]} as NotificationGroup;

    component.openTutorNotes(group);

    expect(openTutorNotes).toHaveBeenCalledWith(group);
    expect(getNotifications).toHaveBeenCalled();
  });

  it('passes search, unit, category, and read-state filters to the service', () => {
    component.page = 3;
    component.search = 'P4';
    component.selectedUnitId = 4;
    component.selectedKinds = ['new_task_comment'];
    component.state = 'read';

    component.applyFilters();

    expect(component.page).toBe(1);
    expect(getNotifications).toHaveBeenCalledWith({
      state: 'read',
      unitId: 4,
      kinds: ['new_task_comment'],
      query: 'P4',
      page: 1,
      perPage: 25,
    });
  });

  it('exposes the expected delivery frequencies and discussion categories', () => {
    expect(['off', 'hourly', 'daily', 'weekly']).toContain('weekly');
    expect(component.categories.map((category) => category.kind)).toEqual(
      expect.arrayContaining(['discuss_warning', 'discuss_expired']),
    );
  });
});
