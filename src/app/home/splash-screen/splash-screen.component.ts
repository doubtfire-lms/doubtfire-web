import { Component, ElementRef, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
@Component({
  selector: 'splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
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
