import {AfterViewInit, ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService, User} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {GradeLineItemStatus, LtiService} from 'src/app/api/services/lti.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UserService} from 'src/app/api/services/user.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {CsvResultModalService} from 'src/app/common/modals/csv-result-modal/csv-result-modal.service';
import {SidekiqProgressModalService} from 'src/app/common/modals/sidekiq-progress-modal/sidekiq-progress-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {errorMessage} from 'src/app/common/services/error-message';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

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
    private ltiService: LtiService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private alertsService: AlertService,
    private unitService: UnitService,
    private projectService: ProjectService,
    private confirmationModalService: ConfirmationModalService,
    private csvResultModalService: CsvResultModalService,
    private sidekiqProgressModalService: SidekiqProgressModalService,
    private constants: DoubtfireConstants,
    private route: ActivatedRoute,
  ) {}

  private readonly launchErrorMessages: Record<string, string> = {
    not_member:
      'You must be enrolled in this course to launch OnTrack, including site administrators.',
  };

  // linkedUnit: UnitLink;
  linkedUnit: Unit;
  linkedProjectId: number;
  currentUser: User;
  unauthorised: boolean = false;
  launchError: string;

  loadingState: 'creatingUser' | 'enrollingUser' | 'fetchingUnit';
  isLoading: boolean;

  isSyncingGrades: boolean;
  isSyncingEnrolments: boolean;
  isLoadingGradeLineItemStatus: boolean;
  isRetryingGradeLineItem: boolean;
  gradeLineItemStatus: GradeLineItemStatus;
  externalName = this.constants.ExternalName;

  ngAfterViewInit(): void {
    // Scroll to the bottom of the page in case the header is visible
    // Ensures our action buttons are centered
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);

    const launchError = this.route.snapshot.queryParamMap.get('launchError');
    if (launchError) {
      this.launchError =
        this.launchErrorMessages[launchError] ?? 'OnTrack could not be launched. Please relaunch.';
      this.alertsService.error(this.launchError, 8000);
      return;
    }

    this.isLoading = true;
    // TODO: add a spinner or loading indicator until final loading state is complete

    this.authenticationService.afterAuthCall(() => {
      this.currentUser = this.userService.currentUser;

      // Retrieve linked unit ID
      this.ltiService.getUnitLink().subscribe({
        next: (link) => {
          if (!link) {
            this.isLoading = false;
            return;
          }

          if (
            this.currentUser?.systemRole === 'Convenor' ||
            this.currentUser?.systemRole === 'Admin'
          ) {
            this.loadGradeLineItemStatus();
          }

          // this.getGrade();

          // Ensure user is enrolled into the linked unit
          this.ltiService.enrolUser(link).subscribe({
            next: (project) => {
              this.linkedProjectId = project?.id;
              // Fetch unit information
              this.unitService.get(link.unitId).subscribe({
                next: (unit) => {
                  this.linkedUnit = unit;
                  this.isLoading = false;
                },
                error: (error) => {
                  this.alertsService.error(
                    errorMessage(error, 'Failed to load the linked unit.'),
                    6000,
                  );
                  this.isLoading = false;
                },
              });
            },
            error: (error) => {
              console.error(error);
              this.alertsService.error(
                errorMessage(error, 'Failed to enrol in the linked unit.'),
                6000,
              );
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

  private loadGradeLineItemStatus(): void {
    this.isLoadingGradeLineItemStatus = true;
    this.ltiService.getGradeLineItemStatus().subscribe({
      next: (status) => {
        this.gradeLineItemStatus = status;
        this.isLoadingGradeLineItemStatus = false;
      },
      error: (error) => {
        console.error(error);
        this.gradeLineItemStatus = {
          configured: false,
          visibility: 'unknown',
          message: errorMessage(error, 'Failed to check the Moodle grade item.'),
        };
        this.isLoadingGradeLineItemStatus = false;
        this.alertsService.error(
          errorMessage(error, 'Failed to check the Moodle grade item.'),
          6000,
        );
      },
    });
  }

  retryGradeLineItem(): void {
    this.isRetryingGradeLineItem = true;
    this.ltiService.retryGradeLineItem().subscribe({
      next: (status) => {
        this.gradeLineItemStatus = status;
        this.isRetryingGradeLineItem = false;
        this.alertsService.success('Moodle grade item is ready.', 5000);
      },
      error: (error) => {
        console.error(error);
        this.gradeLineItemStatus = {
          configured: false,
          visibility: 'unknown',
          message: errorMessage(error, 'Failed to find or create the Moodle grade item.'),
        };
        this.isRetryingGradeLineItem = false;
        this.alertsService.error(
          errorMessage(error, 'Failed to find or create the Moodle grade item.'),
          6000,
        );
      },
    });
  }

  goToLinkUnit(): void {
    this.router.navigate(['/lti/link']);
  }

  removeLink(): void {
    this.ltiService.removeUnitLink().subscribe({
      next: () => {
        this.linkedUnit = null;
        this.gradeLineItemStatus = undefined;
      },
      error: (error) => {
        console.error(error);
        this.alertsService.error(errorMessage(error, 'Failed to remove the unit link.'), 6000);
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
                console.error(error);
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
    if (!this.gradeLineItemStatus?.configured) {
      this.alertsService.error(
        'A Moodle grade item must be linked before grades can be synced.',
        6000,
      );
      return;
    }

    this.confirmationModalService.show(
      'Sync Grades from OnTrack',
      `Before syncing, check in Moodle Gradebook setup that the ${this.externalName.value} grade item is hidden from students. Continue only if it is hidden or the grades are approved for release.`,
      () => {
        this.isSyncingGrades = true;
        this.ltiService.syncStudentsGrades().subscribe({
          next: (result) => {
            this.isSyncingGrades = false;
            this.alertsService.success('Successfully synced grades from OnTrack', 5000);
            this.csvResultModalService.show('Grade sync', result);
          },
          error: (error) => {
            console.error(error);
            this.alertsService.error(errorMessage(error, 'Failed to sync grades'));
            this.isSyncingGrades = false;
          },
        });
      },
    );
  }
  public openOnTrack(): void {
    window.open(window.location.origin, '_blank', 'noopener');
  }

  public openLmsSettings(): void {
    this.launchApplication(`/units/${this.linkedUnit.id}/admin/lms`);
  }

  public launchLinkedUnit(): void {
    if (!this.linkedUnit) {
      return this.launchApplication();
    }
    if (['Tutor', 'Convenor', 'Admin', 'Auditor'].includes(this.linkedUnit.myRole)) {
      return this.launchApplication(`/units/${this.linkedUnit.id}/tasks/inbox`);
    }
    this.launchApplication(
      this.linkedProjectId ? `/projects/${this.linkedProjectId}/dashboard` : undefined,
    );
  }

  public launchApplication(returnTo?: string): void {
    // Open synchronously so popup blockers treat it as a user action, then detach it from this frame.
    const appWindow = window.open('about:blank', '_blank');
    if (!appWindow) {
      this.alertsService.error('Allow pop-ups for this site to open OnTrack in a new tab.', 6000);
      return;
    }
    appWindow.opener = null;

    this.ltiService.createAppHandoff().subscribe({
      next: ({username, authToken}) => {
        const signInUrl = new URL('/sign_in', window.location.origin);
        signInUrl.searchParams.set('username', username);
        signInUrl.searchParams.set('authToken', authToken);
        if (returnTo) {
          signInUrl.searchParams.set('returnTo', returnTo);
        }
        appWindow.location.replace(signInUrl.toString());
      },
      error: (error) => {
        appWindow.close();
        this.alertsService.error(errorMessage(error, 'Failed to open OnTrack in a new tab.'), 6000);
      },
    });
  }
}
