import { Component, Inject, OnInit } from '@angular/core';
import {
  aboutDoubtfireModal,
  calendarModal,
  currentUser,
  userNotificationSettingsModal,
  userSettingsModal,
} from 'src/app/ajs-upgraded-providers';
import { CheckForUpdateService } from 'src/app/sessions/service-worker-updater/check-for-update.service';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { IsActiveUnitRole } from '../pipes/is-active-unit-role.pipe';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  task: any;
  data: { isTutor: boolean } = {
    isTutor: false,
  };
  project: any;
  unitRole: any = null;
  unitRoles: any;
  projects: any;
  filteredUnitRoles: any;
  currentUnitOrProject: any;
  currentView: ViewType;
  showHeader: boolean = true;
  constructor(
    @Inject(currentUser) public CurrentUser,
    @Inject(userSettingsModal) private UserSettingsModal,
    @Inject(userNotificationSettingsModal) private UserNotificationSettingsModal,
    @Inject(calendarModal) private CalendarModal,
    @Inject(aboutDoubtfireModal) private AboutDoubtfireModal,
    private isActiveUnitRole: IsActiveUnitRole,
    private checkForUpdateService: CheckForUpdateService,
    private globalState: GlobalStateService
  ) {
    this.globalState.showHideHeader.subscribe({
      next: (shouldShow) => {
        this.showHeader = shouldShow;
      },
      error: (err) => {},
    });

    this.globalState.unitRolesSubject.subscribe({
      next: (unitRoles) => {
        if (unitRoles == null) return; // might be signing out, or the data has been cleared
        this.unitRoles = unitRoles;

        this.filteredUnitRoles = this.isActiveUnitRole
          .transform(this.unitRoles)
          .filter((role) => this.isUniqueRole(role));
      },
      error: (err) => {},
    });

    this.globalState.projectsSubject.subscribe({
      next: (projects) => {
        if (projects == null) return;
        this.projects = projects;
      },
      error: (err) => {},
    });

    // get the current active unit or project
    this.globalState.currentViewAndEntitySubject.subscribe({
      next: (currentViewAndEntity) => {
        this.currentView = currentViewAndEntity?.viewType;

        if (this.currentView == ViewType.PROJECT) {
          this.updateSelectedProject(currentViewAndEntity.entity);
        } else if (this.currentView == ViewType.UNIT) {
          this.updateSelectedUnitRole(currentViewAndEntity.entity);
        } else {
          this.currentUnitOrProject = null;
        }
      },
      error: (err) => {},
    });
  }

  isUniqueRole = (unit) => {
    let units = this.unitRoles.filter((role: any) => role.unit_id === unit.unit_id);
    return units.length == 1 || unit.role == 'Tutor';
  };

  updateSelectedProject(project) {
    this.currentUnitOrProject = {
      project_id: project.project_id,
      unit_id: project.unit().id,
      code: project.unit().code,
      name: project.unit().name,
      role:
        project.my_role ||
        (typeof project.unit === 'function' ? project.unit().my_role : undefined) ||
        project.role ||
        'Unknown',
    };
    this.project = project;
    this.updateTutor();
  }

  updateSelectedUnitRole(unitRole) {
    this.currentUnitOrProject = {
      code: unitRole.unit_code,
      name: unitRole.unit_name,
      role:
        unitRole.my_role ||
        (typeof unitRole.unit === 'function' ? unitRole.unit().my_role : undefined) ||
        unitRole.role ||
        'Unknown',
    };
    this.unitRole = unitRole;
    this.updateTutor();
  }

  updateTutor() {
    this.data.isTutor =
      this.project != null &&
      (this.currentUnitOrProject.role === 'Convenor' ||
        this.currentUnitOrProject.role === 'Tutor' ||
        this.currentUnitOrProject.role === 'Admin');
  }

  openUserSettings() {
    this.UserSettingsModal.show(this.CurrentUser.profile);
  }

  openNotificationSettings() {
    this.UserNotificationSettingsModal.show(this.CurrentUser.profile);
  }

  update() {
    this.checkForUpdateService.checkForUpdate();
  }

  openAboutModal() {
    this.AboutDoubtfireModal.show();
  }

  openCalendar() {
    this.CalendarModal.show();
  }

  ngOnInit(): void {}
}
