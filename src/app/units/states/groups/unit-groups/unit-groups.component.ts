import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription, of} from 'rxjs';
import {GroupSet, Unit, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

// This component is only displayed to staff
// Students will be shown the projects/states/groups (project-groups) component
@Component({
  selector: 'f-unit-groups',
  templateUrl: './unit-groups.component.html',
  styleUrl: './unit-groups.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitGroupsComponent implements OnInit, OnDestroy {
  @Input() unit$: Observable<Unit>;

  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() selectedGroupSet: GroupSet;

  private unitSub?: Subscription;

  constructor(
    private globalStateService: GlobalStateService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    this.unitSub = this.unit$?.subscribe((unit) => {
      if (!unit) {
        return;
      }

      this.unit = unit;
      this.unitRole = this.findUnitRole(unit.id);
      this.selectedGroupSet = this.selectedGroupSet ?? unit.groupSets?.[0];
    });
  }

  ngOnDestroy(): void {
    this.unitSub?.unsubscribe();
  }

  private findUnitRole(unitId: number): UnitRole {
    const currentView = this.globalStateService.currentViewAndEntitySubject$.value;

    if (currentView?.viewType === ViewType.UNIT) {
      const currentUnitRole = currentView.entity as UnitRole;
      if (currentUnitRole?.unit?.id === unitId) {
        return currentUnitRole;
      }
    }

    let unitRole = this.globalStateService.loadedUnitRoles.currentValues.find(
      (role) => role.unit.id === unitId,
    );

    if (
      !unitRole &&
      (this.userService.currentUser.role === 'Admin' ||
        this.userService.currentUser.role === 'Auditor')
    ) {
      unitRole = this.userService.adminOrAuditorRoleFor(
        this.userService.currentUser.role,
        unitId,
        this.userService.currentUser,
      );
    }

    return unitRole;
  }
}
