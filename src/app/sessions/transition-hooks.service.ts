import { Injectable } from '@angular/core';
import { TransitionService } from '@uirouter/angular';
import { UserService } from '../api/services/user.service';
import { DoubtfireAngularModule } from '../doubtfire-angular.module';
import { GlobalStateService } from '../projects/states/index/global-state.service';
import { DoubtfireConstants } from '../config/constants/doubtfire-constants';

/**
 * The TransitionHooksService is responsible for intercepting transitions between states.
 * This is used to update the global state, and enforce certain routing rules - such as redirecting
 * to the welcome page if the user has not completed first time setup, and accepting the eula.
 */
@Injectable({
  providedIn: DoubtfireAngularModule,
})
export class TransitionHooksService {
  private tiiEnabled = false;

  constructor(
    private userService: UserService,
    private transitions: TransitionService,
    private globalState: GlobalStateService,
    private constants: DoubtfireConstants
  ) {
    // Get the tii settings...
    this.constants.IsTiiEnabled.subscribe((enabled) => {
      this.tiiEnabled = enabled;
    });

    // Hook into "onBefore" to check transitions before they occur
    this.transitions.onBefore({}, (transition) => {
      // Where is the transition coming from and going to?
      const toState = transition.to().name;
      // const fromState = transition.from().name;

      // Setup the global state
      if (this.isInboxState(toState)) {
        this.globalState.setInboxState();
      } else {
        this.globalState.setNotInboxState();
      }

      // Adjust settings such as headers
      switch (toState) {
        case 'timeout':
          return true;
        case 'sign_in':
          this.globalState.hideHeader();
          break;
        case 'welcome':
          // block acess to welcome once run
          if (this.userService.currentUser.hasRunFirstTimeSetup || this.userService.isAnonymousUser()) {
            return false;
          }
          this.globalState.hideHeader();
          break;
        case 'home':
          this.globalState.goHome();
          break;
        default:
          break;
      }

      // Redirect to welcome if user has not run first time setup
      if (
        !this.userService.isAnonymousUser() &&
        !userService.currentUser.hasRunFirstTimeSetup &&
        toState !== 'welcome'
      ) {
        return transition.router.stateService.target('welcome');
      }

      // Redirect to eula if user has not accepted eula
      // they are loged in, have run first time setup,
      // but not accepted eula
      if ( this.tiiEnabled &&
        !this.userService.isAnonymousUser() &&
        userService.currentUser.hasRunFirstTimeSetup &&
        !userService.currentUser.acceptedTiiEula &&
        toState !== 'eula'
      ) {
        return transition.router.stateService.target('eula');
      }
    });
  }

  // function to return true if navigating to inbox or task definition
  private isInboxState(toState: string): boolean {
    // return toState.startsWith('units/tasks/inbox') || toState.endsWith('tasks/definition');
    return toState.startsWith('units/tasks') || toState.endsWith('tasks/definition');
  }
}
