import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {BehaviorSubject, of} from 'rxjs';
import {Project, Task} from 'src/app/api/models/doubtfire-model';
import {NotificationGroup} from 'src/app/api/models/notification';
import {NotificationService} from 'src/app/api/services/notification.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {NotificationActionsService} from './notification-actions.service';
import {NotificationsComponent} from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  const openGroup = vi.fn();
  const markRead = vi.fn(() => of({count: 1}));
  const stopCountPolling = vi.fn();
  const projects: BehaviorSubject<Project[]> = new BehaviorSubject([]);
  const getNotifications = vi.fn(() =>
    of({
      groups: [],
      page: 1,
      perPage: 25,
      total: 0,
      unreadCount: 0,
      unreadCountsByUnit: {3: 2},
    }),
  );
  beforeEach(async () => {
    vi.clearAllMocks();
    projects.next([]);
    await TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            startCountPolling: vi.fn(),
            stopCountPolling,
            unreadCountsByUnit$: of({3: 2}),
            getNotifications,
            markRead,
            markAllRead: vi.fn(() => of({count: 0})),
          },
        },
        {
          provide: GlobalStateService,
          useValue: {unitRolesSubject: of([]), projectsSubject: projects.asObservable()},
        },
        {
          provide: NotificationActionsService,
          useValue: {open: openGroup},
        },
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {queryParamMap: convertToParamMap({})}},
        },
        {provide: AlertService, useValue: {error: vi.fn(), success: vi.fn()}},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(NotificationsComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hides past units unless asked, selected or unread', () => {
    const day = 86_400_000;
    const unit = (id: number, code: string, endsInDays: number) => ({
      id,
      code,
      name: code,
      active: true,
      startDate: new Date(Date.now() - 30 * day),
      endDate: new Date(Date.now() + endsInDays * day),
    });
    projects.next([
      {unit: unit(1, 'COS10009', 10)},
      {unit: unit(2, 'COS20007', -10)},
      {unit: unit(3, 'COS30045', -10)},
    ] as unknown as Project[]);
    fixture.detectChanges();

    // COS30045 has unread notifications, so it stays visible.
    expect(component.visibleUnits.map((u) => u.code)).toEqual(['COS10009', 'COS30045']);
    expect(component.hasPastUnits).toBe(true);

    component.showPastUnits = true;
    expect(component.visibleUnits).toHaveLength(3);

    component.showPastUnits = false;
    component.unitChanged(2);
    expect(component.visibleUnits.map((u) => u.code)).toContain('COS20007');
  });

  it('hides withdrawn units even when they have unread notifications', () => {
    const unit = {
      id: 3,
      code: 'COS30045',
      name: 'COS30045',
      active: true,
      startDate: new Date(Date.now() - 86_400_000),
      endDate: new Date(Date.now() + 86_400_000),
    };
    projects.next([{unit, enrolled: false}] as unknown as Project[]);
    fixture.detectChanges();

    expect(component.visibleUnits).toHaveLength(0);

    component.showPastUnits = true;
    expect(component.visibleUnits.map((u) => u.code)).toEqual(['COS30045']);
  });

  it('delegates opening a notification row to the notification actions service', () => {
    const group = {notificationIds: [1, 2]} as NotificationGroup;

    component.open(group);

    expect(openGroup).toHaveBeenCalledWith(group);
  });

  it('releases its unread-count polling request when destroyed', () => {
    component.ngOnDestroy();

    expect(stopCountPolling).toHaveBeenCalledOnce();
  });

  it('expands a communications email in place and marks it read', () => {
    const group = {
      notificationIds: [9],
      counts: {communication_email: 1},
      read: false,
    } as NotificationGroup;

    component.open(group);

    expect(component.isExpanded(group)).toBe(true);
    expect(markRead).toHaveBeenCalledWith([9]);
    expect(openGroup).not.toHaveBeenCalled();
  });

  it('expands a weekly summary in place and marks it read', () => {
    const group = {
      notificationIds: [10],
      counts: {weekly_summary: 1},
      read: false,
    } as NotificationGroup;

    component.open(group);

    expect(component.isExpanded(group)).toBe(true);
    expect(markRead).toHaveBeenCalledWith([10]);
    expect(openGroup).not.toHaveBeenCalled();
  });

  it('shows all notifications by default', () => {
    component.loadNotifications();

    expect(getNotifications).toHaveBeenCalledWith({
      state: 'all',
      unitId: undefined,
      query: '',
      page: 1,
      perPage: 25,
    });
  });

  it('keeps the unread badge count for each unit', () => {
    component.ngOnInit();

    expect(component.unreadCountForUnit(3)).toBe(2);
    expect(component.unreadCountForUnit(4)).toBe(0);
  });

  it('resolves a weekly focus item to the task loaded for the project dashboard', () => {
    const task = {definition: {abbreviation: 'P4'}} as Task;
    projects.next([
      {
        id: 42,
        unit: {id: 3, code: 'COS10001', name: 'Programming'},
        tasks: [task],
      } as unknown as Project,
    ]);
    component.ngOnInit();

    expect(component.focusTask(42, 'P4')).toBe(task);
    expect(component.focusTask(42, 'P5')).toBeUndefined();
  });

  it('applies unit and read-state filters immediately', () => {
    component.page = 3;
    component.unitChanged(4);
    component.stateChanged('read');

    expect(getNotifications).toHaveBeenCalledWith({
      state: 'read',
      unitId: 4,
      query: '',
      page: 1,
      perPage: 25,
    });
  });

  it('automatically searches shortly after typing stops', () => {
    vi.useFakeTimers();
    component.ngOnInit();
    getNotifications.mockClear();

    component.search = '  portfolio  ';
    component.searchChanged(component.search);
    vi.advanceTimersByTime(399);
    expect(getNotifications).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(getNotifications).toHaveBeenCalledWith({
      state: 'all',
      unitId: undefined,
      query: 'portfolio',
      page: 1,
      perPage: 25,
    });
  });
});
