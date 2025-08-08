import {AfterViewInit, Component, Inject, Input, OnInit} from '@angular/core';
import {StateService, UIRouter} from '@uirouter/angular';
import {ProjectService, User} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {LtiService, UnitLink} from 'src/app/api/services/lti.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-lti-dashboard',
  templateUrl: 'lti-dashboard.component.html',
  styleUrls: ['lti-dashboard.component.scss'],
})
export class LtiDashboardComponent implements AfterViewInit {
  constructor(
    @Inject(UIRouter) private router: UIRouter,
    private ltiService: LtiService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private stateService: StateService,
    private alertsService: AlertService,
    private unitService: UnitService,
    private projectService: ProjectService,
  ) {}

  @Input() ltik: string;

  // linkedUnit: UnitLink;
  linkedUnit: Unit;
  currentUser: User;

  loadingState: 'creatingUser' | 'enrollingUser' | 'fetchingUnit';
  isLoading: boolean;
  ngAfterViewInit(): void {
    // Scroll to the bottom of the page in case the header is visible
    // Ensures our action buttons are centered
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);

    this.isLoading = true;
    // TODO: add a spinner or loading indicator until final loading state is complete

    this.authenticationService.afterAuthCall(() => {
      this.userService.currentUser.ltik = this.ltik;
      this.currentUser = this.userService.currentUser;

      // Retrieve linked unit ID
      this.ltiService.getUnitLink().subscribe({
        next: (link) => {
          if (!link) {
            console.log('no link, cant enrol');
            this.isLoading = false;
            return;
          }
          // Ensure user is enrolled into the linked unit
          this.ltiService.enrolUser(link).subscribe({
            next: () => {
              // Fetch unit information
              this.unitService.get(link.unitId).subscribe({
                next: (unit) => {
                  this.linkedUnit = unit;
                  this.isLoading = false;
                },
                error: (error) => {
                  this.alertsService.error(error.message, 6000);
                  this.isLoading = false;
                },
              });
            },
            error: (error) => {
              console.error(error);
            },
          });
        },
        error: (error) => {
          this.alertsService.error('Unauthorised. Please relaunch the app.', 6000);
        },
      });
    });
  }

  goToLinkUnit(): void {
    this.stateService.go('lti/deeplink', {
      ltik: this.ltik,
    });
  }

  removeLink(): void {
    this.ltiService.removeUnitLink().subscribe({
      next: (link) => {
        this.linkedUnit = null;
        console.log(link);
      },
      error: (error) => {
        console.error(error);
        this.alertsService.error(error.message, 6000);
      },
    });
  }

  public launchApplication(): void {
    window.open('http://localhost:4200/home', '_blank');
  }
}
