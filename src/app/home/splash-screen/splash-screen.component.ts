import { Component, ElementRef, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
@Component({
  selector: 'splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  animations: [
    trigger('simpleFadeAnimation', [
      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),
      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [style({ opacity: 0 }), animate(500)]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave', animate(500, style({ opacity: 0 }))),
    ]),
  ],
})
export class SplashScreenComponent implements OnInit {
  constructor(private host: ElementRef<HTMLElement>, private globalState: GlobalStateService) {}

  options: AnimationOptions = {
    loop: true,
    autoplay: true,
    path: '../../../assets/images/formatif-isolated-lottie.json',
  };

  public ngOnInit(): void {
    this.globalState.isLoadingSubject.subscribe((isLoading) => {
      if (!isLoading) {
        this.host.nativeElement.remove();
      }
    });
  }
}
