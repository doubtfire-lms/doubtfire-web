import {HttpClient} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {Observable, shareReplay} from 'rxjs';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {LoadingService} from './LoadingService.service';

const ANIMATION_URL = 'assets/images/splash-animation.svg';

// How far into the SVG animation it should start from
const ANIMATION_START_SECONDS = 1.75;

@Component({
  selector: 'splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SplashScreenComponent implements OnInit {
  constructor(
    private globalState: GlobalStateService,
    private loadingService: LoadingService,
    private http: HttpClient,
  ) {
    this.loading$ = this.loadingService.loading$;
    // Warm the animation at bootstrap so the first splash has it ready.
    this.animation$ = this.http
      .get(ANIMATION_URL, {responseType: 'text'})
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
    this.animation$.subscribe({error: () => undefined});
  }

  loading$: Observable<boolean>;
  private animation$: Observable<string>;

  @ContentChild('loading')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customLoadingIndicator: TemplateRef<any> | null = null;

  @ViewChild('splashAnimation')
  set splashAnimation(host: ElementRef<HTMLElement> | undefined) {
    if (!host) {
      return;
    }
    this.animation$.subscribe({
      next: (svg) => {
        // Set directly rather than binding: Angular's sanitiser strips SMIL elements.
        host.nativeElement.innerHTML = svg;
        host.nativeElement.querySelector('svg')?.setCurrentTime(ANIMATION_START_SECONDS);
      },
      error: () => undefined,
    });
  }

  public ngOnInit(): void {
    this.globalState.isLoadingSubject.subscribe((isLoading) => {
      if (isLoading) {
        this.loadingService.loadingOn();
      }
      if (!isLoading) {
        this.loadingService.loadingOff();
      }
    });
  }
}
