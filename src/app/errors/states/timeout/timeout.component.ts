import { auth } from 'src/app/ajs-upgraded-providers';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { Component, Inject } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
@Component({
  selector: 'timeout',
  templateUrl: 'timeout.component.html',
})
export class TimeoutComponent {
  constructor(
    @Inject(auth) private Auth: any,
    @Inject(GlobalStateService) private GSS,
    @Inject(UIRouter) private router: UIRouter
  ) {
    GSS.setView('OTHER');
    Auth.signOut();
    setTimeout(() => {
      this.router.stateService.go('sign_in');
    }, 500);

  }
}
