import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription, first, of} from 'rxjs';
import {Unit, UnitRole, User, UserService} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

type UnitAdminTabKey =
  | 'details'
  | 'learning-outcomes'
  | 'staff'
  | 'tutorials'
  | 'students'
  | 'tasks'
  | 'groups'
  | 'communication';

interface UnitAdminTab {
  label: string;
  routeSegment: UnitAdminTabKey;
}

@Component({
  selector: 'f-unit-admin-state',
  templateUrl: './unit-admin-state.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitAdminStateComponent implements OnInit, OnDestroy {
  @Input() public unit$: Observable<Unit>;

  public readonly tabs: UnitAdminTab[] = [
    {label: 'Unit Details', routeSegment: 'details'},
    {label: 'Learning Outcomes', routeSegment: 'learning-outcomes'},
    {label: 'Staff', routeSegment: 'staff'},
    {label: 'Tutorials', routeSegment: 'tutorials'},
    {label: 'Students', routeSegment: 'students'},
    {label: 'Tasks', routeSegment: 'tasks'},
    {label: 'Groups', routeSegment: 'groups'},
    {label: 'Communications', routeSegment: 'communication'},
  ];

  public unit: Unit | null = null;
  public staff: User[] = [];
  public assessingUnitRole: UnitRole | null = null;
  public currentTab: UnitAdminTab = this.tabs[0];
  public loadingUnit = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private globalStateService: GlobalStateService,
  ) {}

  public ngOnInit(): void {
    this.updateCurrentTabFromState(this.route.snapshot.paramMap.get('tab'));

    this.unit$ = this.unit$ ?? of(this.route.parent.snapshot.data.unit);
    if (this.unit$) {
      this.subscriptions.push(
        this.unit$.pipe(first()).subscribe((unit) => {
          if (!unit) {
            return;
          }

          this.assessingUnitRole = this.findUnitRole(unit.id);
          this.loadTutors();
          this.loadUnit(unit);
        }),
      );
    }

    this.subscriptions.push(
      this.route.paramMap.subscribe((params) => this.updateCurrentTabFromState(params.get('tab'))),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public get currentIndex(): number {
    const index = this.tabs.findIndex((tab) => tab.routeSegment === this.currentTab.routeSegment);
    return index >= 0 ? index : 0;
  }

  public onTabChange(event: MatTabChangeEvent): void {
    const nextTab = this.tabs[event.index] ?? this.tabs[0];
    this.currentTab = nextTab;
    if (this.route.parent?.snapshot.data.unit) {
      this.router.navigate(
        [
          '/units',
          this.route.parent.snapshot.paramMap.get('unitId'),
          'admin',
          nextTab.routeSegment,
        ],
        {replaceUrl: true},
      );
      return;
    }
  }

  private updateCurrentTabFromState(tabParam?: string | null): void {
    this.currentTab =
      this.tabs.find((tab) => tab.routeSegment === tabParam) ??
      this.tabs.find((tab) => tab.routeSegment === 'details') ??
      this.tabs[0];
  }

  private findUnitRole(unitId: number): UnitRole | null {
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

    return unitRole ?? null;
  }

  private loadTutors(): void {
    this.subscriptions.push(
      this.userService.getTutors().subscribe((tutors) => {
        this.staff = tutors;
      }),
    );
  }

  private loadUnit(unit: Unit): void {
    this.loadingUnit = false;
    this.unit = unit;

    if (this.assessingUnitRole) {
      this.assessingUnitRole.unit = unit;
    }

    this.globalStateService.setView(
      ViewType.UNIT,
      this.assessingUnitRole ? this.assessingUnitRole : unit,
    );
  }
}
