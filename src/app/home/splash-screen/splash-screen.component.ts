import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  animations: [
    trigger('simpleFadeAnimation', [
      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave', animate(500, style({ opacity: 0 }))),
    ]),
  ],
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  constructor(private globalState: GlobalStateService) {}

  public showSplash = true;
  private subscription: Subscription;

  public ngOnInit(): void {
    this.subscription = this.globalState.isLoadingSubject.subscribe((isLoading) => {
      this.showSplash = isLoading;
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
