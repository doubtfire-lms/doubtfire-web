import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import {
  analyticsService,
  currentUser,
  dateService,
  projectService,
  unitService,
} from 'src/app/ajs-upgraded-providers';

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
  constructor(
    private renderer: Renderer2,
    private constants: DoubtfireConstants,
    @Inject(analyticsService) private AnalyticsService: any,
    @Inject(unitService) private UnitService: any,
    @Inject(dateService) private DateService: any,
    @Inject(projectService) private ProjectService: any,
    @Inject(currentUser) private CurrentUser: any
  ) {
    this.renderer.setStyle(document.body, 'background-color', '#f0f2f5'); //.addClass(document.body, 'body-class');
  }

  public externalName = this.constants.ExternalName;
  public userFirstName = this.CurrentUser.profile.nickname || this.CurrentUser.profile.first_name;

  // public showDate = this.dateService.showDate;
  ngOnDestroy(): void {
    this.renderer.setStyle(document.body, 'background-color', '#fff');
  }
  ngOnInit(): void {
    // $scope.showDate = dateService.showDate

    this.AnalyticsService.event('Home', 'Viewed Home page');

    let hasRoles = false;
    let hasProjects = false;

    this.UnitService.getUnitRoles((roles: any) => {
      this.unitRoles = roles;
      hasRoles = true;
      this.ProjectService.getProjects(false, (projects: any) => {
        this.projects = projects;
        this.showSpinner = false;
        this.dataLoaded = true;
        hasProjects = true;
      });
    });
  }

  showDate = this.DateService.showDate;

  generateUnitProgress(project) {
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const today = new Date();

    //use Math.abs to avoid sign
    const q = Math.abs(today.valueOf() - start.valueOf());
    const d = Math.abs(end.valueOf() - start.valueOf());
    // alert('Rounded: ' + Math.round((q / d) * 100) + '%');
    // alert('Fraction: ' + (q / d) * 100 + '%');
    return Math.round((q / d) * 100);
  }

  // notEnrolled() {
  //   // Not enrolled if a tutor and no unitRoles
  //   (this.unitRoles.length is 0 and this.currentUser.role === 'Tutor') ||
  //   // Not enrolled if a student and no projects
  //      (this.projects.length is 0 and this.currentUser.role === 'Student')
  // }
}
