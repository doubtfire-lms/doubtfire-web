import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {Subscription, filter} from 'rxjs';
import {HeaderComponent} from './common/header/header.component';
import {SplashScreenComponent} from './home/splash-screen/splash-screen.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HeaderComponent, SplashScreenComponent, RouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSub?: Subscription;

  constructor(
    private router: Router,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.setBodyBackground(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.setBodyBackground(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private setBodyBackground(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    const background = path === '/home' || path === '/' ? '#f5f5f5' : '#fff';
    this.renderer.setStyle(document.body, 'background-color', background);
  }
}
