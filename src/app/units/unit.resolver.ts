import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {Observable, first} from 'rxjs';
import {Unit, UnitRole, UnitService, UserService} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

export const resolveUnit: ResolveFn<Unit> = (route, state) => {
  const unitService = inject(UnitService);
  const globalState = inject(GlobalStateService);
  const userService = inject(UserService);
  const alertService = inject(AlertService);
  const unitId = Number(route.paramMap.get('unitId'));

  return new Observable<Unit>((observer) => {
    globalState.onLoad(() => {
      let unitRole = globalState.loadedUnitRoles.currentValues.find(
        (role) => role.unit.id === unitId,
      );

      if (
        !unitRole &&
        (userService.currentUser.role === 'Admin' || userService.currentUser.role === 'Auditor')
      ) {
        unitRole = userService.adminOrAuditorRoleFor(
          userService.currentUser.role,
          unitId,
          userService.currentUser,
        );
      }

      const resolveProgressively = shouldResolveUnitProgressively(state.url, unitId);
      if (resolveProgressively) {
        const unit =
          unitRole?.unit ?? unitService.cache.getOrCreate(unitId, unitService, {id: unitId});
        globalState.setView(ViewType.UNIT, routeEntity(unit, unitRole));
        observer.next(unit);
        observer.complete();
        return;
      }

      unitService.get(unitId).subscribe({
        next: (unit) => {
          globalState.setView(ViewType.UNIT, routeEntity(unit, unitRole));
          if (!resolveProgressively) {
            observer.next(unit);
            observer.complete();
          }
        },
        error: (err) => {
          if (unitRole?.unit) {
            globalState.setView(ViewType.UNIT, unitRole);
            if (!resolveProgressively) {
              observer.next(unitRole.unit);
              observer.complete();
            }
            return;
          }

          alertService.error('Error loading unit: ' + err, 8000);
          observer.error(err);
        },
      });
    });
  }).pipe(first());
};

// Task routes can activate their outer shell while their component fetches detailed data.
function shouldResolveUnitProgressively(url: string, unitId: number): boolean {
  const pathname = url.split('?')[0];
  return new RegExp(`^/units/${unitId}/tasks(?:/|$)`).test(pathname);
}

function routeEntity(unit: Unit, unitRole?: UnitRole): Unit | UnitRole {
  if (!unitRole) {
    return unit;
  }

  unitRole.unit = unit;
  return unitRole;
}
