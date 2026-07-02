/* eslint-disable @typescript-eslint/no-unused-vars */
import {MediaObserver} from 'ng-flex-layout';
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription, asapScheduler, observeOn} from 'rxjs';
import {
  AuthenticationService,
  Project,
  Task,
  Unit,
  UnitRole,
  User,
} from 'src/app/api/models/doubtfire-model';
import {SidekiqJobEntry, SidekiqJobService} from 'src/app/api/services/sidekiq-job.service';
import {UserService} from 'src/app/api/services/user.service';
import {DoubtfireConstants, LogoSettings} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';
import {CheckForUpdateService} from 'src/app/sessions/service-worker-updater/check-for-update.service';
import {AboutDoubtfireModal} from '../modals/about-doubtfire-modal/about-doubtfire-modal.component';
import {CalendarModalService} from '../modals/calendar-modal/calendar-modal.service';
import {QrModalService} from '../modals/qr-modal/qr-modal.service';
import {SidekiqJobsModalService} from '../modals/sidekiq-jobs-modal/sidekiq-jobs-modal.service';
import {TutorNotesModalService} from '../modals/tutor-notes-modal/tutor-notes-modal.service';
import {IsActiveUnitRole} from '../pipes/is-active-unit-role.pipe';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy {
  task: Task;
  data: {isTutor: boolean} = {
    isTutor: false,
  };
  unitRoles: UnitRole[];
  projects: Project[];
  filteredUnitRoles: UnitRole[];

  currentUnit: Unit = null;
  currentProject: Project = null;
  currentUnitRole: UnitRole = null;

  currentView: ViewType;
  showHeader = true;

  logoSettings: LogoSettings = {
    hasLogo: false,
    logoLinkUrl: '/assets/images/institution-logo.png',
    logoUrl: null,
  };
  private subscriptions: Subscription[] = [];

  sidekiqJobs: SidekiqJobEntry[] = [];

  constructor(
    private calendarModal: CalendarModalService,
    private aboutDoubtfireModal: AboutDoubtfireModal,
    private isActiveUnitRole: IsActiveUnitRole,
    private checkForUpdateService: CheckForUpdateService,
    protected globalState: GlobalStateService,
    private userService: UserService,
    private authService: AuthenticationService,
    protected media: MediaObserver,
    protected doubtfireConstants: DoubtfireConstants,
    private sidekiqJobService: SidekiqJobService,
    private sidekiqJobsModalService: SidekiqJobsModalService,
    private qrModalService: QrModalService,
    private router: Router,
    private tutorNotesModal: TutorNotesModalService,
  ) {}

  public externalName: string;

  ngOnInit(): void {
    this.doubtfireConstants.ExternalName.subscribe((externalName) => {
      this.externalName = externalName;
    });
    this.subscriptions.push(
      this.globalState.showHideHeader.subscribe({
        next: (shouldShow) => {
          this.showHeader = shouldShow;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (err) => {
          console.log(`Error showing header: ${err}`);
        },
      }),
    );

    this.subscriptions.push(
      this.globalState.unitRolesSubject.subscribe({
        next: (unitRoles) => {
          if (unitRoles == null) {
            return;
          } // might be signing out, or the data has been cleared
          this.unitRoles = unitRoles;

          this.filteredUnitRoles = this.isActiveUnitRole
            .transform(this.unitRoles)
            .filter((role) => this.isUniqueRole(role));
        },
        error: (err) => {
          console.log(`Error fetching unit roles: ${err}`);
        },
      }),
    );

    this.subscriptions.push(
      this.globalState.projectsSubject.subscribe({
        next: (projects) => {
          if (!projects) {
            return;
          }
          this.projects = projects.filter((project) => project?.unit?.myRole === 'Student');
        },
        error: (err) => {
          console.log(`Error fetching projects: ${err}`);
        },
      }),
    );

    // get the current active unit or project
    this.subscriptions.push(
      this.globalState.currentViewAndEntitySubject$.pipe(observeOn(asapScheduler)).subscribe({
        next: (currentViewAndEntity) => {
          this.currentView = currentViewAndEntity?.viewType;

          if (this.currentView == ViewType.PROJECT) {
            this.updateSelectedProject(currentViewAndEntity.entity as Project);
          } else if (this.currentView == ViewType.UNIT) {
            if (currentViewAndEntity.entity instanceof UnitRole) {
              this.updateSelectedUnitRole(currentViewAndEntity.entity as UnitRole);
            } else if (currentViewAndEntity.entity instanceof Unit) {
              this.updateSelectedUnit(currentViewAndEntity.entity as Unit);
            }
          } else {
            this.currentUnit = null;
            this.currentProject = null;
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (err) => {
          console.log(`Error on switching view and entity: ${err}`);
        },
      }),
    );

    // Subscribe to logo changes
    this.subscriptions.push(
      this.doubtfireConstants.LogoSettings.subscribe({
        next: (settings) => {
          this.logoSettings = settings;
        },
        error: (err) => {
          console.log(`Error getting settings: ${err}`);
        },
      }),
    );

    this.sidekiqJobService.sidekiqJobsSubject.subscribe((jobs) => {
      this.sidekiqJobs = [...jobs];
    });
  }

  showMyQr() {
    const hostName = this.doubtfireConstants.HOST_URL;

    const projectView =
      this.currentProject &&
      this.currentProject.student &&
      this.currentProject.student.username !== this.currentUser.username;

    const username = projectView ? this.currentProject.student.username : this.currentUser.username;
    if (projectView || this.currentUser.role === 'Student') {
      const url = `${hostName}/tutor-discussion?unitId=${this.currentUnit.id}&username=${username}`;
      this.qrModalService.show(
        url,
        'Display this QR code during your class so your tutor can scan it to view your submissions and mark your tasks as complete.',
        projectView ? `Viewing QR for ${this.currentProject.student.name}` : '',
        true,
      );
    } else {
      this.router.navigate(['/units', this.currentUnit.id, 'discussion']);
    }
  }

  public get isTutorDiscussionRoute(): boolean {
    return this.router.url.split('?')[0].endsWith('/discussion');
  }

  showSidekiqJob() {
    this.sidekiqJobsModalService.show();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  isUniqueRole = (unit) => {
    const units = this.unitRoles.filter((role: UnitRole) => role.unit?.id === unit.unit?.id);
    return units.length == 1 || unit.role == 'Tutor';
  };

  updateSelectedProject(project: Project): void {
    this.currentProject = project;
    this.currentUnit = project.unit;
    if (this.currentUnitRole?.unit.id !== this.currentUnit.id) {
      this.currentUnitRole = null;
    }
  }

  updateSelectedUnitRole(unitRole: UnitRole): void {
    this.currentProject = null;
    this.currentUnitRole = unitRole;
    this.currentUnit = unitRole.unit;
  }

  updateSelectedUnit(unit: Unit): void {
    this.currentUnit = unit;
    this.currentProject = null;

    this.currentUnitRole = unit.staff.find(
      (ur) => ur.user?.id === this.userService.currentUser?.id,
    );

    if (this.currentUnitRole) {
      // Re-map Unit onto UnitRole object
      this.currentUnitRole.unit = unit;
    }
  }

  update(): void {
    this.checkForUpdateService.checkForUpdate();
  }

  openAboutModal(): void {
    this.aboutDoubtfireModal.show();
  }

  openCalendar(): void {
    this.calendarModal.show(null);
  }

  signOut(): void {
    this.authService.signOut();
  }

  get currentUser(): User {
    return this.userService.currentUser;
  }

  openTutorNotes() {
    this.tutorNotesModal.show(null, this.currentUnitRole);
  }
}
