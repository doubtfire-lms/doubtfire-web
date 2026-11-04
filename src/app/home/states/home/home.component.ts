import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {
  Project,
  Unit,
  UnitRole,
  UnitService,
  User,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {DateService} from 'src/app/common/services/date.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
  projects: Project[];
  unitRoles: UnitRole[];
  observedUnits: Unit[] = [];
  loadingObservedUnits = false;
  showSpinner: boolean;
  dataLoaded: boolean;
  notEnrolled: boolean;
  ifAdmin: boolean;
  ifConvenor: boolean;
  loadingUnitRoles: boolean;
  loadingProjects: boolean;

  constructor(
    private constants: DoubtfireConstants,
    private globalState: GlobalStateService,
    private userService: UserService,
    private unitService: UnitService,
    @Inject(DateService) private DateService: DateService,
    private router: Router,
  ) {
    // projects and units are loaded as part of global state service at login
  }

  public externalName = this.constants.ExternalName;
  public userFirstName = this.currentUser.nickname || this.currentUser.firstName;

  private subscriptions: Subscription[] = [];

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.globalState.showHeader();
    this.globalState.setView(ViewType.OTHER);

    this.loadingUnitRoles = true;
    this.loadingProjects = true;

    this.subscriptions.push(
      this.globalState.unitRolesSubject.subscribe({
        next: (unitRoles) => this.unitRolesLoaded(unitRoles),
      }),
    );

    this.subscriptions.push(
      this.globalState.projectsSubject.subscribe({
        next: (projects) => {
          projects = projects.filter((project) => project.unit.myRole === 'Student');
          this.projectsLoaded(projects);
        },
      }),
    );

    this.notEnrolled = this.checkEnrolled();

    this.globalState.onLoad(() => {
      if (!this.currentUser.observeAllUnits) {
        return;
      }

      this.loadingObservedUnits = true;
      this.subscriptions.push(
        this.unitService.fetchAll().subscribe({
          next: (units) => {
            const assignedRoles = new Map(
              this.globalState.loadedUnitRoles.currentValues.map((role) => [role.unit.id, role]),
            );
            this.observedUnits = units
              .filter((unit) => {
                const assignedRole = assignedRoles.get(unit.id);
                return unit.isActive && (!assignedRole || assignedRole.observerOnly);
              })
              .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
            this.loadingObservedUnits = false;
          },
          error: () => {
            this.loadingObservedUnits = false;
          },
        }),
      );
    });

    if (this.currentUser.role === 'Auditor') {
      this.router.navigateByUrl('/admin/units');
    }

    this.ifAdmin = this.currentUser.role === 'Admin';
    this.ifConvenor = this.currentUser.role === 'Convenor';
  }

  get currentUser(): User {
    return this.userService.currentUser;
  }

  unitRolesLoaded(unitRoles: UnitRole[]): void {
    this.unitRoles = unitRoles;
    this.loadingUnitRoles = false;
  }

  projectsLoaded(projects: Project[]): void {
    this.projects = projects;
    this.loadingProjects = false;
  }

  checkEnrolled(): boolean {
    if (this.unitRoles != null || this.projects != null) {
      return false;
    }

    return (
      (this.unitRoles?.length === 0 && this.currentUser.role === 'Tutor') ||
      (this.projects?.length === 0 && this.currentUser.role === 'Student')
    );
  }

  showDate = this.DateService.showDate;
}
