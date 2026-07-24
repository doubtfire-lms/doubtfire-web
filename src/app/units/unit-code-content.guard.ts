import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree} from '@angular/router';
import {Observable, filter, map, take} from 'rxjs';
import {Unit} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';

export const resolveUnitCodeContent: CanActivateFn = (
  route: ActivatedRouteSnapshot,
): Observable<UrlTree> => {
  const alertService = inject(AlertService);
  const globalState = inject(GlobalStateService);
  const router = inject(Router);
  const unitCode = route.paramMap.get('unitCode') ?? '';
  const contentRouteSegments = route.url.slice(2).map((segment) => segment.path);

  return globalState.isLoadingSubject.pipe(
    filter((isLoading) => !isLoading),
    take(1),
    map(() => {
      const unit = latestUnitForCode(globalState, unitCode);

      if (!unit) {
        alertService.error(
          `You are not enrolled in or employed in a ${unitCode.toUpperCase()} unit.`,
          8000,
        );
        return router.createUrlTree(['/home']);
      }

      return router.createUrlTree(['/units', unit.id, 'content', ...contentRouteSegments], {
        fragment: route.fragment,
      });
    }),
  );
};

function latestUnitForCode(globalState: GlobalStateService, unitCode: string): Unit | undefined {
  const unitsById: Map<number, Unit> = new Map();

  globalState.currentUserProjects.currentValues.forEach((project) => {
    if (project.unit) {
      unitsById.set(project.unit.id, project.unit);
    }
  });

  globalState.loadedUnitRoles.currentValues.forEach((unitRole) => {
    if (unitRole.unit) {
      unitsById.set(unitRole.unit.id, unitRole.unit);
    }
  });

  const normalisedCode = unitCode.toLocaleLowerCase();

  return [...unitsById.values()]
    .filter((unit) => unit.code.toLocaleLowerCase() === normalisedCode)
    .sort((a, b) => b.startDate.valueOf() - a.startDate.valueOf() || b.id - a.id)[0];
}
