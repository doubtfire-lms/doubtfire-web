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
import {NotificationsComponent} from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  const markRead = vi.fn(() => of({count: 1}));
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
            getPreferences: vi.fn(() => of([])),
            markRead,
            markAllRead: vi.fn(() => of({count: 0})),
          },
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

  it('marks a task group read before navigating', () => {
    const group = {
      notificationIds: [1, 2],
      task: {projectId: 8, abbreviation: 'P4', staffView: false},
      read: false,
    } as NotificationGroup;

    component.openTask(group);

    expect(markRead).toHaveBeenCalledWith([1, 2]);
    expect(navigate).toHaveBeenCalledWith(['/projects', 8, 'dashboard', 'P4']);
  });

  it('opens staff task notifications in tutor mode', () => {
    const group = {
      notificationIds: [3],
      task: {projectId: 9, abbreviation: 'P5', staffView: true},
      read: true,
    } as NotificationGroup;

    component.openTask(group);

    expect(markRead).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/projects', 9, 'dashboard', 'P5'], {
      queryParams: {tutor: true},
    });
  });

  it('marks only tutor-note events and focuses the latest relevant note', () => {
    const group = {
      unit: {id: 4},
      tutorNoteUnitRoleId: 22,
      tutorNoteNotificationIds: [7, 8],
      tutorNoteIds: [50, 51],
    } as NotificationGroup;

    component.openTutorNotes(group);

    expect(markRead).toHaveBeenCalledWith([7, 8]);
    expect(getUnit).toHaveBeenCalledWith(4);
    expect(showTutorNotes).toHaveBeenCalledWith(undefined, {id: 22}, 51);
  });

  it('passes search, unit, category, and read-state filters to the service', () => {
    component.page = 3;
    component.search = 'P4';
    component.selectedUnitId = 4;
    component.selectedKinds = ['feedback_left'];
    component.state = 'read';

    component.applyFilters();

    expect(component.page).toBe(1);
    expect(getNotifications).toHaveBeenCalledWith({
      state: 'read',
      unitId: 4,
      kinds: ['feedback_left'],
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
