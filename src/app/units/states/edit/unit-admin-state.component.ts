import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {TransitionService} from '@uirouter/angular';
import {StateService} from '@uirouter/core';
import {Observable, Subscription, first} from 'rxjs';
import {Unit, UnitRole, User, UserService} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';
import {NgHybridStateDeclaration} from '@uirouter/angular-hybrid';

type UnitAdminTabKey =
  | 'details'
  | 'learning-outcomes'
  | 'staff'
  | 'tutorials'
  | 'students'
  | 'tasks'
  | 'groups';

interface UnitAdminTab {
  label: string;
  routeSegment: UnitAdminTabKey;
}

@Component({
  selector: 'f-unit-admin-state',
  templateUrl: './unit-admin-state.component.html',
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
  ];

  public unit: Unit | null = null;
  public staff: User[] = [];
  public assessingUnitRole: UnitRole | null = null;
  public currentTab: UnitAdminTab = this.tabs[0];

  private subscriptions: Subscription[] = [];
  private deregisterStateSuccessHook?: () => void;

  constructor(
    private stateService: StateService,
    private transitionService: TransitionService,
    private userService: UserService,
    private globalStateService: GlobalStateService,
  ) {}

  public ngOnInit(): void {
    this.updateCurrentTabFromState(this.stateService.params.tab);

    if (this.unit$) {
      this.subscriptions.push(
        this.unit$.pipe(first()).subscribe((unit) => {
          if (!unit) {
            return;
          }

          this.unit = unit;
          this.assessingUnitRole = this.findUnitRole(unit.id);
          this.loadTutors();
        }),
      );
    }

    const deregister = this.transitionService.onSuccess({to: '**'}, (transition) => {
      if (transition.to().name === 'units/admin') {
        this.updateCurrentTabFromState(transition.params().tab);
      }
    });

    this.deregisterStateSuccessHook = deregister as () => void;
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.deregisterStateSuccessHook?.();
  }

  public get currentIndex(): number {
    const index = this.tabs.findIndex((tab) => tab.routeSegment === this.currentTab.routeSegment);
    return index >= 0 ? index : 0;
  }

  public onTabChange(event: MatTabChangeEvent): void {
    const nextTab = this.tabs[event.index] ?? this.tabs[0];
    this.currentTab = nextTab;
    this.stateService.go('.', {tab: nextTab.routeSegment}, {notify: false, location: 'replace'});
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
}

export const UnitAdminState: NgHybridStateDeclaration = {
  name: 'units/admin',
  parent: 'unit-root-state',
  url: '/admin/:tab',
  params: {
    tab: {value: 'details', squash: true, dynamic: true},
  },
  views: {
    unitView: {
      component: UnitAdminStateComponent,
    },
  },
  data: {
    task: 'Unit Administration',
    pageTitle: '_Unit Administration_',
    roleWhitelist: ['Convenor', 'Admin', 'Auditor'],
  },
};
