import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {Observable, first} from 'rxjs';
import {
  FeedbackTemplateService,
  Unit,
  UnitRole,
  UnitService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

export const resolveUnit: ResolveFn<Unit> = (route, state) => {
  const unitService = inject(UnitService);
  const globalState = inject(GlobalStateService);
  const userService = inject(UserService);
  const feedbackTemplateService = inject(FeedbackTemplateService);
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

      if (unitRole && unitRole.role !== 'Student') {
        feedbackTemplateService.query({contextType: 'units', contextId: unitId}, {}).subscribe({
          error: () => alertService.error('Error loading unit feedback templates.', 8000),
        });
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

      unitService.loadDetails(unitId).subscribe({
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

// Inbox-style task routes can activate their outer shell while their component fetches detailed
// data. The task list routes use the resolved unit directly, so they must wait for the full unit.
function shouldResolveUnitProgressively(url: string, unitId: number): boolean {
  const pathname = url.split('?')[0];
  return new RegExp(`^/units/${unitId}/tasks/(?:inbox|definition|moderation|overflow)(?:/|$)`).test(
    pathname,
  );
}

function routeEntity(unit: Unit, unitRole?: UnitRole): Unit | UnitRole {
  if (!unitRole) {
    return unit;
  }

  unitRole.unit = unit;
  return unitRole;
}
