import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {analyticsService, dateService} from 'src/app/ajs-upgraded-providers';
import {UIRouter} from '@uirouter/angular';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';
import {Project, UnitRole, User, UserService} from 'src/app/api/models/doubtfire-model';
import {Subscription} from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  projects: Project[];
  unitRoles: UnitRole[];
  showSpinner: boolean;
  dataLoaded: boolean;
  notEnrolled: boolean;
  ifAdmin: boolean;
  ifConvenor: boolean;
  loadingUnitRoles: boolean;
  loadingProjects: boolean;

  constructor(
    private renderer: Renderer2,
    private constants: DoubtfireConstants,
    private globalState: GlobalStateService,
    private userService: UserService,
    @Inject(analyticsService) private AnalyticsService: any,
    @Inject(dateService) private DateService: any,
    @Inject(UIRouter) private router: UIRouter,
  ) {
    // this.renderer.setStyle(document.body, 'background-color', '#f0f2f5');
    // projects and units are loaded as part of global state service at login
  }

  public externalName = this.constants.ExternalName;
  public userFirstName = this.currentUser.nickname || this.currentUser.firstName;

  private subscriptions: Subscription[] = [];

  ngOnDestroy(): void {
    // this.renderer.setStyle(document.body, 'background-color', '#fff');
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    // const last = this.router.stateRegistry.get()[this.router.stateRegistry.get().length - 1];
    // this.router.stateService.go(last, {projectId: 55});
    if (this.userService.isAnonymousUser()) {
      this.router.stateService.go('sign_in');
    }

    this.AnalyticsService.event('Home', 'Viewed Home page');
    this.globalState.setView(ViewType.OTHER);

    this.loadingUnitRoles = true;
    this.loadingProjects = true;

    this.subscriptions.push(
      this.globalState.unitRolesSubject.subscribe({
        next: (unitRoles) => this.unitRolesLoaded(unitRoles),
        error: (err) => {},
      }),
    );

    this.subscriptions.push(
      this.globalState.projectsSubject.subscribe({
        next: (projects) => {
          projects = projects.filter((project) => project.unit.myRole === 'Student');
          this.projectsLoaded(projects);
        },
        error: (err) => {},
      }),
    );

    this.notEnrolled = this.checkEnrolled();

    if (this.currentUser.role === 'Auditor') {
      this.router.stateService.go('admin/units');
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
    if (this.unitRoles != null || this.projects != null) return false;

    return (
      (this.unitRoles?.length === 0 && this.currentUser.role === 'Tutor') ||
      (this.projects?.length === 0 && this.currentUser.role === 'Student')
    );
  }

  showDate = this.DateService.showDate;
}
