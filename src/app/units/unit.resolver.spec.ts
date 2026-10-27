import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap} from '@angular/router';
import {Observable, firstValueFrom, of} from 'rxjs';
import {
  FeedbackTemplateService,
  Unit,
  UnitService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {resolveUnit} from './unit.resolver';

describe('resolveUnit', () => {
  const unit = {id: 20} as Unit;
  const unitRole = {role: 'Convenor', unit};
  const feedbackTemplateService = {
    query: vi.fn(() => of([])),
  };
  const unitService = {
    loadDetails: vi.fn(() => of(unit)),
  };
  const userService = {
    currentUser: {isStaff: true, role: 'Admin'},
    adminOrAuditorRoleFor: vi.fn(),
  };
  const globalState = {
    loadedUnitRoles: {currentValues: [unitRole]},
    onLoad: vi.fn((callback: () => void) => callback()),
    setView: vi.fn(),
  };
  const alertService = {
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        {provide: FeedbackTemplateService, useValue: feedbackTemplateService},
        {provide: UnitService, useValue: unitService},
        {provide: UserService, useValue: userService},
        {provide: GlobalStateService, useValue: globalState},
        {provide: AlertService, useValue: alertService},
      ],
    });
  });

  it('loads unit feedback templates for staff', async () => {
    const route = {
      paramMap: convertToParamMap({unitId: 20}),
    } as ActivatedRouteSnapshot;
    const state = {url: '/units/20/admin'} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      resolveUnit(route, state),
    ) as Observable<Unit>;
    await firstValueFrom(result);

    expect(feedbackTemplateService.query).toHaveBeenCalledWith(
      {contextType: 'units', contextId: 20},
      {},
    );
  });
});
