import {Component, ElementRef, NgZone, OnDestroy} from '@angular/core';
import {isTopLevelAngularPath} from './top-level-routing';

@Component({
  selector: 'doubtfire-shell',
  template: `
    <app-header></app-header>
    <splash-screen></splash-screen>
    <doubtfire-angular-router-host></doubtfire-angular-router-host>
    <div class="container-fluid" ui-view="main"></div>
  `,
})
export class DoubtfireShellComponent implements OnDestroy {
  private readonly visibilityCheckHandle: ReturnType<typeof setInterval>;

  constructor(
    private ngZone: NgZone,
    private elementRef: ElementRef<HTMLElement>,
  ) {
    this.syncLegacyViewVisibility(window.location.pathname);
    this.visibilityCheckHandle = this.ngZone.runOutsideAngular(() =>
      setInterval(() => this.syncLegacyViewVisibility(window.location.pathname), 100),
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.visibilityCheckHandle);
  }

  private syncLegacyViewVisibility(url: string): void {
    const legacyMainView = this.elementRef.nativeElement.querySelector('[ui-view="main"]');
    if (!legacyMainView) {
      return;
    }

    legacyMainView instanceof HTMLElement &&
      (legacyMainView.style.display = isTopLevelAngularPath(url) ? 'none' : '');
  }
}
