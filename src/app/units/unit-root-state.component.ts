/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from '../app-injector';
import {NgHybridStateDeclaration} from '@uirouter/angular-hybrid';
import {Ng2ViewDeclaration} from '@uirouter/angular';
import {GlobalStateService, ViewType} from '../projects/states/index/global-state.service';
import {StateService} from '@uirouter/core';
import {AlertService} from '../common/services/alert.service';
import {UnitService} from '../api/services/unit.service';
import {UserService} from '../api/services/user.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'f-unit-root-state',
  templateUrl: './unit-root-state.component.html',
  styleUrl: './unit-root-state.component.css',
})
export class UnitRootStateComponent implements OnInit, OnDestroy {
  @Input() public unit$: Observable<Unit>;
  @Input() public unitRole$: Observable<UnitRole>;

  public unit: Unit;
  public unitRole: UnitRole;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Subscribe to observables and store values for Angular template
    if (this.unit$) {
      const unitSub = this.unit$.subscribe((unit) => {
        this.unit = unit;
      });
      this.subscriptions.push(unitSub);
    }

    if (this.unitRole$) {
      const roleSub = this.unitRole$.subscribe((unitRole) => {
        this.unitRole = unitRole;
      });
      this.subscriptions.push(roleSub);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

export const UnitRootState: NgHybridStateDeclaration = {
  name: 'units/index',
  url: '/units/:unitId',
  abstract: true,
  data: {
    pageTitle: '_Home_',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
  views: {
    main: {
      controller: function($scope, unit$, unitRole$) {
        // Set observables on $scope for template binding to Angular component
        $scope.unit$ = unit$;
        $scope.unitRole$ = unitRole$;

        // Subscribe and set values on $scope for AngularJS child states
        unit$.subscribe((unit) => {
          $scope.unit = unit;
        });
        unitRole$.subscribe((unitRole) => {
          $scope.unitRole = unitRole;
        });
      },
      template: '<f-unit-root-state [unit$]="unit$" [unitRole$]="unitRole$"></f-unit-root-state>',
    } as unknown as Ng2ViewDeclaration,
  },

  resolve: {
    unit$: function ($stateParams) {
      const unitService = AppInjector.get(UnitService);
      const stateService = AppInjector.get(StateService);
      const alertService = AppInjector.get(AlertService);

      const unitId = parseInt($stateParams.unitId);
      if (!unitId) {
        stateService.go('home');
        return;
      }

      return unitService.get(unitId).pipe(
        first()
      );
    },
    unitRole$: function ($stateParams, unit$) {
      const globalState = AppInjector.get(GlobalStateService);
      const userService = AppInjector.get(UserService);
      const stateService = AppInjector.get(StateService);
      const alertService = AppInjector.get(AlertService);

      return new Observable<UnitRole>((observer) => {
        globalState.onLoad(() => {
          const unitId = parseInt($stateParams.unitId);

          let role = globalState.loadedUnitRoles.currentValues.find(
            (ur) => ur.unit.id === unitId
          );

          if (!role && (userService.currentUser.role === 'Admin' || userService.currentUser.role === 'Auditor')) {
            role = userService.adminOrAuditorRoleFor(
              userService.currentUser.role,
              unitId,
              userService.currentUser
            );
          }

          if (!role) {
            alertService.error('You do not have access to this unit', 6000);
            stateService.go('home');
            observer.complete();
            return;
          }

          globalState.setView(ViewType.UNIT, role);
          observer.next(role);
          observer.complete();
        });
      }).pipe(first());
    },
  },
};