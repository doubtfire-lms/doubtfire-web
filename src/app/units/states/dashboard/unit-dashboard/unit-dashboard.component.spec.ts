import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {BehaviorSubject, NEVER, of} from 'rxjs';
import {ProjectService, TaskService, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {NotificationService} from 'src/app/api/services/notification.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {UnitDashboardComponent} from './unit-dashboard.component';

describe('UnitDashboardComponent', () => {
  let fixture: ComponentFixture<UnitDashboardComponent>;
  let routeData: BehaviorSubject<{unit?: Unit}>;
  let currentView: BehaviorSubject<{entity: UnitRole} | null>;

  beforeEach(async () => {
    routeData = new BehaviorSubject<{unit?: Unit}>({});
    currentView = new BehaviorSubject<{entity: UnitRole} | null>(null);

    await TestBed.configureTestingModule({
      imports: [UnitDashboardComponent],
      providers: [
        provideRouter([]),
        {provide: ActivatedRoute, useValue: {parent: {data: routeData}}},
        {provide: ProjectService, useValue: {loadStudents: () => NEVER}},
        {provide: TaskService, useValue: {getOverflowAvailableToClaimCount: () => NEVER}},
        {provide: NotificationService, useValue: {getNotifications: () => NEVER}},
        {provide: AlertService, useValue: {}},
        {provide: GlobalStateService, useValue: {currentViewAndEntitySubject$: currentView}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UnitDashboardComponent);
  });

  function openDashboard(role: string): HTMLElement {
    const unit = Object.assign(new Unit(), {id: 1, getUserMarkingSessions: () => of([])});
    unit.getTaskTurnaround = () => of({unit_id: 1, task_definitions: []});
    currentView.next({entity: Object.assign(new UnitRole(), {id: 1, unit, role})});
    routeData.next({unit});
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('renders the tutor dashboard loading state for a tutor', () => {
    const page = openDashboard('Tutor');

    expect(page.querySelector('a[href$="#tutor-dashboard"]')?.textContent).toContain('Tutor');
    expect(page.textContent).toContain('Ready for feedback');
    expect(page.textContent).toContain('Needs help');
    expect(page.textContent).toContain('Feedback overdue');
    expect(page.textContent).toContain('... unread messages');
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Loading weekly summary');
    expect(page.querySelector('f-open-inbox-button a[href]')?.textContent).toContain('Open inbox');
  });

  it('renders the convenor view and a plain moderator badge for a convenor', () => {
    const page = openDashboard('Convenor');

    expect(page.querySelector('a[href$="#convenor-dashboard"]')?.textContent).toContain('Convenor');
    expect(page.querySelector('f-convenor#convenor-dashboard')).not.toBeNull();
    expect(page.textContent).toContain('Moderator');
    expect(page.querySelectorAll('a')).toHaveLength(2);
    expect(page.querySelector('f-tutor-dashboard')).toBeNull();
  });
});
