import { Component, Inject, OnInit } from '@angular/core';
import {
  aboutDoubtfireModal,
  calendarModal,
  currentUser,
  userNotificationSettingsModal,
  userSettingsModal,
} from 'src/app/ajs-upgraded-providers';
import { CheckForUpdateService } from 'src/app/sessions/service-worker-updater/check-for-update.service';
import { UIRouter } from '@uirouter/angular';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  currentUser: any;
  unit: any = null;
  task: any;
  data: { isTutor: boolean } = {
    isTutor: false,
  };
  project: any;
  unitRole: any;
  constructor(
    @Inject(currentUser) private CurrentUser,
    @Inject(userSettingsModal) private UserSettingsModal,
    @Inject(userNotificationSettingsModal) private UserNotificationSettingsModal,
    @Inject(calendarModal) private CalendarModal,
    @Inject(aboutDoubtfireModal) private AboutDoubtfireModal,
    private checkForUpdateService: CheckForUpdateService,
    private router: UIRouter,
    private globalState: GlobalStateService
  ) {
    this.currentUser = this.CurrentUser.profile;

    // This a hacky, temporary workaround which uses the upgraded rootScope
    this.globalState.project.subscribe((project) => {
      this.updateSelectedProject(project);
    });

    this.globalState.unitRole.subscribe((unitRole) => {
      this.updateSelectedUnitRole(unitRole);
    });
    // this.rootScope.$on('UnitRoleChanged', this.updateSelectedUnit.bind(this));
    // this.rootScope.$on('ProjectChanged', this.updateSelectedUnit.bind(this));

    // this.router.transitionService.onSuccess(
    //   { to: '**' },
    //   (trans) => (this.task = __guard__(trans.to().data, (x) => x.task))
    // );
    // function __guard__(value, transform) {
    //   return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
    // }

    this.router.transitionService
      .onSuccess(
        {
          to: '**',
        },
        (trans) => {
          let ref1;
          this.task = (ref1 = trans.to().data) != null ? ref1.task : void 0;
          console.log(this.task);
        }
      )
      .bind(this);
  }

  updateSelectedProject(project) {
    this.unit = {
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

  updateTutor() {
    this.data.isTutor =
      this.project != null && (this.unit.role == 'Convenor' || this.unit.role == 'Tutor' || this.unit.role == 'Admin');
  }

  updateSelectedUnitRole(unitRole) {
    this.unit = {
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

  openUserSettings() {
    this.UserSettingsModal.show(this.currentUser);
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
