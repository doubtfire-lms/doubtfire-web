import { Component, Inject, OnInit } from '@angular/core';
import {
  aboutDoubtfireModal,
  calendarModal,
  currentUser,
  rootScope,
  userNotificationSettingsModal,
  userSettingsModal,
} from 'src/app/ajs-upgraded-providers';
import { CheckForUpdateService } from 'src/app/sessions/service-worker-updater/check-for-update.service';
import { UIRouter } from '@uirouter/angular';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  currentUser: any;
  unit: { code: any; name: any; role: any };
  task: any;
  constructor(
    @Inject(currentUser) private CurrentUser,
    @Inject(userSettingsModal) private UserSettingsModal,
    @Inject(userNotificationSettingsModal) private UserNotificationSettingsModal,
    @Inject(calendarModal) private CalendarModal,
    @Inject(aboutDoubtfireModal) private AboutDoubtfireModal,
    @Inject(rootScope) private rootScope,
    private checkForUpdateService: CheckForUpdateService,
    private router: UIRouter
  ) {
    this.currentUser = this.CurrentUser.profile;

    // This a hacky, temporary workaround which uses the upgraded rootScope
    this.rootScope.$on('UnitRoleChanged', this.updateSelectedUnit.bind(this));
    this.rootScope.$on('ProjectChanged', this.updateSelectedUnit.bind(this));

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

  updateSelectedUnit(event, data) {
    let context = data.context;
    if (context == null) return;

    this.unit = {
      code: context.unit_code || context.unit().code,
      name: context.unit_name || context.unit().name,
      role:
        context.my_role ||
        (typeof context.unit === 'function' ? context.unit().my_role : undefined) ||
        context.role ||
        'Unknown',
    };
    this[context.role != null ? 'unitRole' : 'project'] = context;
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

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }
}
