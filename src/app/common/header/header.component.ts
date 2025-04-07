/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { aboutDoubtfireModal, calendarModal } from 'src/app/ajs-upgraded-providers';
import { CheckForUpdateService } from 'src/app/sessions/service-worker-updater/check-for-update.service';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { IsActiveUnitRole } from '../pipes/is-active-unit-role.pipe';
import { UserService } from 'src/app/api/services/user.service';
import { AuthenticationService, Project, Task, Unit, UnitRole, User } from 'src/app/api/models/doubtfire-model';
import { Subscription } from 'rxjs';
import { MediaObserver } from 'ng-flex-layout';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  task: Task;
  data: { isTutor: boolean } = {
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

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(calendarModal) private CalendarModal,
    @Inject(aboutDoubtfireModal) private AboutDoubtfireModal,
    private isActiveUnitRole: IsActiveUnitRole,
    private checkForUpdateService: CheckForUpdateService,
    protected globalState: GlobalStateService,
    private userService: UserService,
    private authService: AuthenticationService,
    protected media: MediaObserver,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.globalState.showHideHeader.subscribe({
        next: (shouldShow) => {
          this.showHeader = shouldShow;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (err) => {},
      }),
    );

    this.subscriptions.push(
      this.globalState.unitRolesSubject.subscribe({
        next: (unitRoles) => {
          if (unitRoles == null) return; // might be signing out, or the data has been cleared
          this.unitRoles = unitRoles;

          this.filteredUnitRoles = this.isActiveUnitRole
            .transform(this.unitRoles)
            .filter((role) => this.isUniqueRole(role));
        },
        error: (err) => {},
      }),
    );

    this.subscriptions.push(
      this.globalState.projectsSubject.subscribe({
        next: (projects) => {
          if (!projects) return;
          this.projects = projects.filter((project) => project?.unit?.myRole === 'Student');
        },
        error: (err) => {},
      }),
    );

    // get the current active unit or project
    this.subscriptions.push(
      this.globalState.currentViewAndEntitySubject$.subscribe({
        next: (currentViewAndEntity) => {
          this.currentView = currentViewAndEntity?.viewType;

          if (this.currentView == ViewType.PROJECT) {
            this.updateSelectedProject(currentViewAndEntity.entity as Project);
          } else if (this.currentView == ViewType.UNIT) {
            this.updateSelectedUnitRole(currentViewAndEntity.entity as UnitRole);
          } else {
            this.currentUnit = null;
            this.currentProject = null;
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (_err) => {},
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  isUniqueRole = (unit) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const units = this.unitRoles.filter((role: any) => role.unit.id === unit.unit.id);
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

  update(): void {
    this.checkForUpdateService.checkForUpdate();
  }

  openAboutModal(): void {
    this.AboutDoubtfireModal.show();
  }

  openCalendar(): void {
    this.CalendarModal.show();
  }

  signOut(): void {
    this.authService.signOut();
  }

  get currentUser(): User {
    return this.userService.currentUser;
  }
}
