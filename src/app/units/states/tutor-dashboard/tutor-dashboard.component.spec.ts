import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router, convertToParamMap} from '@angular/router';
import {BehaviorSubject, of} from 'rxjs';
import {Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {TutorDashboardComponent} from './tutor-dashboard.component';

describe('TutorDashboardComponent', () => {
  let fixture: ComponentFixture<TutorDashboardComponent>;
  let component: TutorDashboardComponent;
  let paramMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const ownRole = {
    id: 11,
    role: 'Convenor',
    user: {id: 1, name: 'Convenor One'},
  } as UnitRole;
  const tutorRole = {
    id: 12,
    role: 'Tutor',
    user: {id: 2, name: 'Tutor Two'},
  } as UnitRole;
  const unit = {
    id: 7,
    code: 'COS100',
    staff: [ownRole, tutorRole],
  } as unknown as Unit;

  const dashboardResponse = {
    generated_at: '2026-07-28T00:00:00Z',
    unit_role: {
      id: ownRole.id,
      role: ownRole.role,
      user: {
        id: ownRole.user.id,
        name: ownRole.user.name,
        first_name: 'Convenor',
        last_name: 'One',
        nickname: '',
      },
    },
    thresholds: {warning_days: 4, overflow_days: 7},
    inbox: {
      total_count: 0,
      ready_for_feedback_count: 0,
      overdue_count: 0,
      needs_help_count: 0,
      unread_activity_count: 0,
      pinned_count: 0,
      age_buckets: {
        within_threshold_count: 0,
        warning_count: 0,
        overdue_count: 0,
        missing_submission_date_count: 0,
      },
      oldest_tasks: [],
      by_task_definition: [],
    },
    tutor_notes: {total_count: 0, unread_by_tutor_count: 0},
    moderation: {pending_count: 0},
    permissions: {
      can_switch_tutor: true,
      can_view_moderation: true,
      can_view_overflow: false,
      can_access_tutor_notes: true,
    },
  };

  const unitService = {
    tutorDashboard: vi.fn(() => of(dashboardResponse)),
  };
  const router = {navigate: vi.fn()};
  const globalState = {setView: vi.fn()};

  beforeEach(async () => {
    paramMap = new BehaviorSubject(convertToParamMap({}));
    unitService.tutorDashboard.mockClear();
    router.navigate.mockClear();

    await TestBed.configureTestingModule({
      declarations: [TutorDashboardComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {snapshot: {data: {unit}}},
            paramMap,
          },
        },
        {provide: Router, useValue: router},
        {provide: UnitService, useValue: unitService},
        {provide: UserService, useValue: {currentUser: ownRole.user}},
        {provide: GlobalStateService, useValue: globalState},
        {provide: AlertService, useValue: {error: vi.fn()}},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TutorDashboardComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(TutorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the current unit role when no role is in the URL', () => {
    expect(unitService.tutorDashboard).toHaveBeenCalledWith(unit, ownRole.id);
    expect(component.selectedUnitRole).toBe(ownRole);
    expect(component.dashboard).toEqual(dashboardResponse);
  });

  it('navigates to the selected tutor URL', () => {
    component.selectTutor(tutorRole.id);

    expect(router.navigate).toHaveBeenCalledWith(['/units', unit.id, 'dashboard', tutorRole.id]);
  });
});
