import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription, distinctUntilChanged, filter, map} from 'rxjs';
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
  private shownUnitId?: number;

  constructor(
    private globalStateService: GlobalStateService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // The route reuses this component when switching between units, so follow the resolved
    // unit rather than reading it once from the route snapshot.
    const unit$ = this.unit$ ?? this.route.parent.data.pipe(map((data) => data.unit as Unit));

    this.unitSub = unit$
      .pipe(
        filter((unit) => !!unit),
        distinctUntilChanged((previous, current) => previous.id === current.id),
      )
      .subscribe((unit) => {
        // Group sets belong to a unit, so only the first unit shown can keep one that was
        // supplied by a parent component.
        const isUnitChange = this.shownUnitId !== undefined;

        this.shownUnitId = unit.id;
        this.unit = unit;
        this.unitRole = this.findUnitRole(unit.id);

        if (isUnitChange || !this.selectedGroupSet) {
          this.selectedGroupSet = unit.groupSets?.[0];
        }
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
