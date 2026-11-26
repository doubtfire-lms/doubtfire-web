import {describe, expect, it} from 'vitest';
import {ActivatedRouteSnapshot, convertToParamMap} from '@angular/router';
import {UnitRole, User, UserService} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {roleForRoute} from './role-whitelist.guard';

describe('roleForRoute', () => {
  it.each(['Student', 'Tutor'])(
    'uses the system administrator role instead of the %s unit role',
    (unitRoleName) => {
      const administrator = new User();
      administrator.systemRole = 'Admin';

      const unitRole = {
        role: unitRoleName,
        unit: {id: 42},
      } as UnitRole;
      const route = {
        paramMap: convertToParamMap({unitId: 42}),
      } as ActivatedRouteSnapshot;
      const userService = {
        currentUser: administrator,
      } as UserService;
      const globalState = {
        loadedUnitRoles: {currentValues: [unitRole]},
      } as unknown as GlobalStateService;

      expect(roleForRoute(route, userService, globalState)).toBe('Admin');
    },
  );
});
