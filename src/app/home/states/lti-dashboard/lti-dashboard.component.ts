import {AfterViewInit, ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService, User} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {LtiService} from 'src/app/api/services/lti.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {CsvResultModalService} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-lti-dashboard',
  templateUrl: 'lti-dashboard.component.html',
  styleUrls: ['lti-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LtiDashboardComponent implements AfterViewInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ltiService: LtiService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private alertsService: AlertService,
    private unitService: UnitService,
    private projectService: ProjectService,
    private confirmationModalService: ConfirmationModalService,
    private csvResultModalService: CsvResultModalService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
  ) {}

  @Input() ltik: string;

  // linkedUnit: UnitLink;
  linkedUnit: Unit;
  currentUser: User;
  unauthorised: boolean = false;

  loadingState: 'creatingUser' | 'enrollingUser' | 'fetchingUnit';
  isLoading: boolean;

  isSyncingGrades: boolean;
  isSyncingEnrolments: boolean;

  ngAfterViewInit(): void {
    this.ltik = this.ltik ?? this.route.snapshot.queryParamMap.get('ltik');

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

          // this.getGrade();

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
                  this.alertsService.error(error.error || error, 6000);
                  this.isLoading = false;
                },
              });
            },
            error: (error) => {
              console.error(error);
              this.isLoading = false;
            },
          });
        },
        error: (_error) => {
          this.alertsService.error('Unauthorised. Please relaunch the app.', 6000);
          this.unauthorised = true;
        },
      });
    });
  }

  goToLinkUnit(): void {
    this.router.navigate(['/lti/link'], {queryParams: {ltik: this.ltik}});
  }

  removeLink(): void {
    this.ltiService.removeUnitLink().subscribe({
      next: (link) => {
        this.linkedUnit = null;
        console.log(link);
      },
      error: (error) => {
        console.error(error);
        this.alertsService.error(error.error, 6000);
      },
    });
  }

  // getGrade(): void {
  //   this.ltiService.getGrade().subscribe({
  //     next: (result) => {
  //       console.log('grade result?: ', result);
  //       console.log(JSON.stringify(result));
  //     },
  //     error: (error) => {
  //       console.log(error);
  //     },
  //   });
  // }

  // syncMyGrade(): void {
  //   this.ltiService.syncGrade().subscribe({
  //     next: (result) => {
  //       console.log('Successfully synced grade from OnTrack');
  //       this.alertsService.success('Successfully synced grade from OnTrack', 5000);
  //     },
  //     error: (error) => {
  //       console.log(error);
  //       this.alertsService.error(`Failed to retrieve grade`);
  //     },
  //   });
  // }

  syncEnrolments(): void {
    if (!this.linkedUnit) {
      this.alertsService.error(
        `Course must be linked to an OnTrack unit before you can sync members.`,
        6000,
      );
      return;
    }

    this.ltiService.getMembers().subscribe({
      next: (members) => {
        this.confirmationModalService.show(
          'Sync Enrolments into OnTrack',
          `Are you sure you want to import ${members.members.length} users into ${this.linkedUnit.code} ${this.linkedUnit.name}`,
          () => {
            this.isSyncingEnrolments = true;
            this.ltiService.syncEnrolments().subscribe({
              next: (job) => {
                if (!job) {
                  this.isSyncingEnrolments = false;
                  return this.alertsService.error(`Failed to sync enrolments`);
                }

                this.sidekiqProgressModalService
                  .show('Syncing users into OnTrack', job.id)
                  .subscribe((completedJob) => {
                    this.isSyncingEnrolments = false;
                    this.csvResultModalService.show(
                      'Enrolment sync',
                      JSON.parse(completedJob.result),
                    );
                    this.alertsService.success('Successfully imported users into OnTrack', 5000);
                  });
              },
              error: (error) => {
                console.log(error);
                this.alertsService.error(`Failed to sync enrolments`);
                this.isSyncingEnrolments = false;
              },
            });
          },
        );
      },
      error: (_error) => {
        this.alertsService.error('Failed to retrieve course members', 6000);
      },
    });
  }

  syncStudentsGrades(): void {
    this.confirmationModalService.show(
      'Sync Grades from OnTrack',
      'Are you sure you want to sync portfolio grades from OnTrack? Please confirm that grades are final and approved for release.',
      () => {
        this.isSyncingGrades = true;
        this.ltiService.syncStudentsGrades().subscribe({
          next: (result) => {
            this.isSyncingGrades = false;
            this.alertsService.success('Successfully synced grades from OnTrack', 5000);
            this.csvResultModalService.show('Grade sync', result);
          },
          error: (error) => {
            console.log(error);
            this.alertsService.error(`Failed to retrieve grade`);
            this.isSyncingGrades = true;
          },
        });
      },
    );
  }
  public launchApplication(): void {
    window.open('http://localhost:4200/home', '_blank');
  }
}
