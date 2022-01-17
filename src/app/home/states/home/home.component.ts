import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { analyticsService, currentUser, dateService } from 'src/app/ajs-upgraded-providers';
import { UIRouter } from '@uirouter/angular';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  projects: any;
  unitRoles: any;
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
    @Inject(analyticsService) private AnalyticsService: any,
    @Inject(dateService) private DateService: any,
    @Inject(currentUser) private CurrentUser: any,
    @Inject(UIRouter) private router: UIRouter
  ) {
    this.renderer.setStyle(document.body, 'background-color', '#f0f2f5');
    globalState.loadUnitsAndProjects();
  }

  public externalName = this.constants.ExternalName;
  public userFirstName = this.CurrentUser.profile.nickname || this.CurrentUser.profile.first_name;

  ngOnDestroy(): void {
    this.renderer.setStyle(document.body, 'background-color', '#fff');
  }
  ngOnInit(): void {
    this.AnalyticsService.event('Home', 'Viewed Home page');
    this.globalState.setView(ViewType.OTHER);
    this.globalState.showHeader();

    this.testForNewUserWizard();

    this.loadingUnitRoles = true;
    this.loadingProjects = true;

    this.globalState.unitRolesSubject.subscribe({
      next: (unitRoles) => this.unitRolesLoaded(unitRoles),
      error: (err) => {},
    });

    this.globalState.projectsSubject.subscribe({
      next: (projects) => this.projectsLoaded(projects),
      error: (err) => {},
    });

    this.notEnrolled = this.checkEnrolled();

    this.ifAdmin = this.CurrentUser.role === 'Admin';
    this.ifConvenor = this.CurrentUser.role === 'Convenor';
  }

  unitRolesLoaded(unitRoles: any): void {
    this.unitRoles = unitRoles;
    this.loadingUnitRoles = false;
  }

  projectsLoaded(projects: any): void {
    this.projects = projects;
    this.loadingProjects = false;
  }

  checkEnrolled(): boolean {
    if (this.unitRoles != null || this.projects != null) return false;

    return (
      (this.unitRoles?.length === 0 && this.CurrentUser.role === 'Tutor') ||
      (this.projects?.length === 0 && this.CurrentUser.role === 'Student')
    );
  }

  showDate = this.DateService.showDate;

  generateUnitProgress(project) {
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const today = new Date();

    //use Math.abs to avoid sign
    if (today <= start) return 0;
    if (today >= end) return 100;

    const q = Math.abs(today.valueOf() - start.valueOf());
    const d = Math.abs(end.valueOf() - start.valueOf());
    return Math.round((q / d) * 100);
  }

  testForNewUserWizard() {
    let firstTimeUser = this.CurrentUser.profile.has_run_first_time_setup === false;
    let userHasNotOptedIn = this.CurrentUser.profile.opt_in_to_research === null;

    let showNewUserWizard = firstTimeUser || userHasNotOptedIn;
    userHasNotOptedIn = userHasNotOptedIn && !firstTimeUser;

    if (showNewUserWizard) {
      this.router.stateService.go('welcome', { optInOnly: userHasNotOptedIn });
    }

    return showNewUserWizard;
  }
}
