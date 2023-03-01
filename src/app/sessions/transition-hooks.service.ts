import { Injectable } from '@angular/core';
import { TransitionService } from '@uirouter/angular';
import { UserService } from '../api/services/user.service';
import { DoubtfireAngularModule } from '../doubtfire-angular.module';
import { GlobalStateService } from '../projects/states/index/global-state.service';

@Injectable({
  providedIn: DoubtfireAngularModule,
})
export class TransitionHooksService {
  constructor(
    private userService: UserService,
    private transitions: TransitionService,
    private globalState: GlobalStateService
  ) {
    this.transitions.onBefore({}, (transition) => {
      const toState = transition.to().name;
      const fromState = transition.from().name;

      switch (toState) {
        case 'sign_in':
          this.globalState.hideHeader();
          break;
        case 'welcome':
          if (this.userService.currentUser.hasRunFirstTimeSetup || this.userService.isAnonymousUser()) {
            return false;
          }
          this.globalState.hideHeader();
          break;
        case 'home':
          this.globalState.showHeader();
          break;
        default:
          break;
      }

      if (toState.startsWith('units/tasks/inbox') || toState.endsWith('tasks/definition')) {
        this.globalState.showFooter();
      } else {
        this.globalState.hideFooter();
      }

      if (
        !this.userService.isAnonymousUser() &&
        !userService.currentUser.hasRunFirstTimeSetup &&
        toState !== 'welcome'
      ) {
        return transition.router.stateService.target('welcome');
      }
    });
  }
}
