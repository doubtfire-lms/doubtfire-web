/* eslint-disable @typescript-eslint/no-explicit-any */
import {CdkDragEnd, CdkDragMove, CdkDragStart} from '@angular/cdk/drag-drop';
import {Component, Input, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  auditTime,
  first,
  merge,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';
import {Unit, UnitService, UserService} from 'src/app/api/models/doubtfire-model';
import { AppInjector } from '../app-injector';
import { NgHybridStateDeclaration } from '@uirouter/angular-hybrid';
import { GlobalStateService, ViewType } from '../projects/states/index/global-state.service';
import { StateService } from '@uirouter/core';
import { AlertService } from '../common/services/alert.service';

@Component({
  selector: 'f-unit-root-state',
  templateUrl: './unit-root-state.component.html',
  styleUrl: './unit-root-state.component.css',
})
export class UnitRootStateComponent {
  @Input() public unit$: Observable<Unit>;
}

export const UnitRootState: NgHybridStateDeclaration = {
  name: 'unit-root-state',
  url: '/units2/:unitId',
  abstract: true,
  data: {
    pageTitle: 'Unit Root State',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
  views: {
    main: {
      component: UnitRootStateComponent,
    },
  },
  resolve: {
    unit$: function ($stateParams) {
      const unitService = AppInjector.get(UnitService);
      const globalState = AppInjector.get(GlobalStateService);
      const userService = AppInjector.get(UserService);
      const stateService = AppInjector.get(StateService);

      return new Observable<Unit>((observer) => {
        globalState.onLoad(() => {
          const unitId: number = parseInt($stateParams.unitId);
          let unitRole = globalState.loadedUnitRoles.currentValues.find(
            (unitRole) => unitRole.unit.id === unitId,
          );

          if (
            !unitRole &&
            (userService.currentUser.role == 'Admin' || userService.currentUser.role == 'Auditor')
          ) {
            unitRole = userService.adminOrAuditorRoleFor(
              userService.currentUser.role,
              unitId,
              userService.currentUser,
            );
          }

          // Go home if no unit role was found
          if (!unitRole) {
            console.log('No unit role found for unit', unitId);
            return stateService.go('home');
          }

          unitService.get(unitId).subscribe({
            next: (unit: Unit) => {
              observer.next(unit);
              globalState.setView(ViewType.UNIT, unitRole);
              observer.complete();
            },
            error: (err) => {
              AppInjector.get(AlertService).error('Error loading unit: ' + err, 8000);
              setTimeout(() => stateService.go('home'), 5000);
            }
          });
        });
      }).pipe(first());
    },
  },
};
