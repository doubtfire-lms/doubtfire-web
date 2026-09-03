import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {TutorNotesModalService} from 'src/app/common/modals/tutor-notes-modal/tutor-notes-modal.service';
import {NotificationActionsService} from './notification-actions.service';

describe('NotificationActionsService', () => {
  let service: NotificationActionsService;
  const navigate = vi.fn(() => Promise.resolve(true));
  const markRead = vi.fn(() => of({count: 1}));
  const showTutorNotes = vi.fn();
  const getUnit = vi.fn(() => of({staff: [{id: 22}]}));

  const groupFor = (overrides: Partial<NotificationGroup> = {}) =>
    ({
      notificationIds: [1, 2],
      tutorNoteNotificationIds: [],
      task: {projectId: 8, abbreviation: 'P4', staffView: false},
      read: false,
      ...overrides,
    }) as NotificationGroup;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        NotificationActionsService,
        {provide: NotificationService, useValue: {markRead}},
        {provide: UnitService, useValue: {get: getUnit}},
        {provide: TutorNotesModalService, useValue: {show: showTutorNotes}},
        {provide: Router, useValue: {navigate}},
      ],
    });
    service = TestBed.inject(NotificationActionsService);
  });

  it('marks a group read after opening its task', async () => {
    service.open(groupFor());

    expect(navigate).toHaveBeenCalledWith(['/projects', 8, 'dashboard', 'P4'], {queryParams: {}});
    await vi.waitFor(() => expect(markRead).toHaveBeenCalledWith([1, 2]));
  });

  it('does not mark an already read group again', () => {
    service.open(groupFor({read: true}));

    expect(markRead).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });

  it('opens staff notifications in tutor mode', () => {
    service.open(groupFor({task: {projectId: 9, abbreviation: 'P5', staffView: true} as never}));

    expect(navigate).toHaveBeenCalledWith(['/projects', 9, 'dashboard', 'P5'], {
      queryParams: {tutor: true},
    });
  });

  it('opens the report for a failed overseer run', () => {
    service.open(groupFor({overseerAssessmentId: 4242}));

    expect(navigate).toHaveBeenCalledWith(['/projects', 8, 'dashboard', 'P4'], {
      queryParams: {overseerAssessmentId: 4242},
    });
  });

  it('opens the mod notes tab for a note about the task tutor', () => {
    service.open(groupFor({tutorNoteNotificationIds: [7], tutorNoteOnTaskTutor: true}));

    expect(navigate).toHaveBeenCalledWith(['/projects', 8, 'dashboard', 'P4'], {
      queryParams: {view: 'tutor_notes'},
    });
    expect(showTutorNotes).not.toHaveBeenCalled();
  });

  it('opens the thread itself for a note about anyone else', () => {
    service.open(
      groupFor({
        unit: {id: 4} as never,
        tutorNoteNotificationIds: [7],
        tutorNoteUnitRoleId: 22,
        tutorNoteIds: [50, 51],
      }),
    );

    expect(showTutorNotes).toHaveBeenCalledWith(undefined, expect.objectContaining({id: 22}), 51);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('opens the modal for a moderation note that has no task', () => {
    service.open(
      groupFor({
        task: undefined,
        unit: {id: 4} as never,
        tutorNoteNotificationIds: [7, 8],
        tutorNoteUnitRoleId: 22,
        tutorNoteIds: [50, 51],
      }),
    );

    expect(markRead).not.toHaveBeenCalled();
    expect(getUnit).toHaveBeenCalledWith(4);
    expect(showTutorNotes).toHaveBeenCalledWith(undefined, expect.objectContaining({id: 22}), 51);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('falls back to the notification list when there is no task and no note', () => {
    service.open(groupFor({task: undefined}));

    expect(navigate).toHaveBeenCalledWith(['/notifications']);
  });

  it('opens a communications email expanded on the notification list', () => {
    service.open(
      groupFor({
        task: undefined,
        counts: {communication_email: 1},
        messageSubject: 'A message',
        messageBody: 'The full body',
      }),
    );

    expect(markRead).toHaveBeenCalledWith([1, 2]);
    expect(navigate).toHaveBeenCalledWith(['/notifications'], {
      queryParams: {expanded: 1},
    });
  });

  it('opens the portfolio for a portfolio notification', () => {
    service.open(
      groupFor({task: undefined, projectId: 8, counts: {portfolio_ready: 1}, read: false}),
    );

    expect(markRead).toHaveBeenCalledWith([1, 2]);
    expect(navigate).toHaveBeenCalledWith(['/projects', 8, 'portfolio']);
  });

  it('still opens the task when marking read fails', async () => {
    markRead.mockReturnValueOnce(throwError(() => new Error('nope')) as never);

    service.open(groupFor());

    expect(navigate).toHaveBeenCalled();
    await vi.waitFor(() => expect(markRead).toHaveBeenCalled());
  });

  it('keeps the notification unread when navigation is cancelled', async () => {
    navigate.mockResolvedValueOnce(false);

    service.open(groupFor());
    await navigate.mock.results[0].value;

    expect(markRead).not.toHaveBeenCalled();
  });
});
