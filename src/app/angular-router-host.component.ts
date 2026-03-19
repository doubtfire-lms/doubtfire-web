import {Component, ElementRef, NgZone, OnDestroy} from '@angular/core';
import {isTopLevelAngularPath} from './top-level-routing';

@Component({
  selector: 'doubtfire-angular-router-host',
  template: `
    @if (showTopLevelRoute) {
      <router-outlet></router-outlet>
    }
  `,
})
export class AngularRouterHostComponent implements OnDestroy {
  showTopLevelRoute = isTopLevelAngularPath(window.location.pathname);
  private readonly visibilityCheckHandle: ReturnType<typeof setInterval>;

  constructor(
    private ngZone: NgZone,
    private elementRef: ElementRef<HTMLElement>,
  ) {
    this.syncVisibility(window.location.pathname);
    this.visibilityCheckHandle = this.ngZone.runOutsideAngular(() =>
      setInterval(() => this.syncVisibility(window.location.pathname), 100),
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.visibilityCheckHandle);
  }

  private syncVisibility(url: string): void {
    const showTopLevelRoute = isTopLevelAngularPath(url);

    if (showTopLevelRoute === this.showTopLevelRoute) {
      return;
    }

    this.elementRef.nativeElement.style.display = showTopLevelRoute ? '' : 'none';
    this.ngZone.run(() => {
      this.showTopLevelRoute = showTopLevelRoute;
    });
  }
}
