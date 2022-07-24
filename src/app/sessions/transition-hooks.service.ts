import { Injectable } from '@angular/core';
import { TransitionService } from '@uirouter/angular';
import { AppInjector } from '../app-injector';
import { DoubtfireAngularModule } from '../doubtfire-angular.module';
import { GlobalStateService } from '../projects/states/index/global-state.service';

@Injectable({
  providedIn: DoubtfireAngularModule,
})
export class TransitionHooksService {
  constructor() {
    const transitions = AppInjector.get(TransitionService);
    const globalState = AppInjector.get(GlobalStateService);
    transitions.onBefore({}, (transition) => {
      if (transition.to().name === 'sign_in') {
        console.log('sign_in');
        globalState.hideHeader();
      }

      if (transition.to().name === 'welcome') {
        console.log('welcome');
        globalState.hideHeader();
      }

      if (transition.to().name === 'home') {
        console.log('home');
        globalState.showHeader();
      }
    });
  }
}
