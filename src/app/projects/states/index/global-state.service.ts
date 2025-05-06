import {Inject, Injectable, OnDestroy} from '@angular/core';
import {MediaObserver} from 'ng-flex-layout';
import {UIRouter} from '@uirouter/angular';
import {EntityCache} from 'ngx-entity-service';
import {BehaviorSubject, Observable, Subject, skip, take} from 'rxjs';
import {
  CampusService,
  Project,
  ProjectService,
  TeachingPeriodService,
  Unit,
  UnitRole,
  UnitRoleService,
  UnitService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {AlertService} from 'src/app/common/services/alert.service';

/**
 * The different types of views that can be shown. Used by the header to determine details to show.
 */
export enum ViewType {
  UNIT = 'UNIT',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
}

/**
 * The current view and entity being shown in the application - maintained currentViewAndEntitySubject$
 * of the global state. This connects with the header to ensure the correct details are shown.
 */
export class DoubtfireViewState {
  public entity: Project | Unit | UnitRole;
  public viewType: ViewType;
}

@Injectable({
  providedIn: 'root',
})
/**
 * The global state for the current user. This uses replay subjects, which acts as subjects, but allow
 * for subscribers to request the previously emitted value.
 *
 * This maintains two sets of values:
 * - Units taught and subjects studied
 * - Current view and selected entity
 */
export class GlobalStateService implements OnDestroy {
  /**
   * The current view and entity, indicating what kind of page is being shown.
   */
  public currentViewAndEntitySubject$: BehaviorSubject<DoubtfireViewState> =
    new BehaviorSubject<DoubtfireViewState | null>(null);

  /**
   * The unit roles loaded from the server
   */
  public loadedUnitRoles: EntityCache<UnitRole>;

  /**
   * The loaded units.
   */
  public loadedUnits: EntityCache<Unit>;

  /**
   * The loaded projects.
   */
  public currentUserProjects: EntityCache<Project>;

  private _showFooter = false;
  private _showFooterWarning = false;

  /**
   * A Unit Role for when a tutor is viewing a Project.
   */
  // public get unitRoleSubject(): Observable<UnitRole>;

  /**
   * The list of all of the units taught by the current user
   */
  public get unitRolesSubject(): Observable<UnitRole[]> {
    return this.loadedUnitRoles.values;
  }

  /**
   * The list of all of the units studied by the current user
   */
  public get projectsSubject(): Observable<Project[]> {
    return this.currentUserProjects.values;
  }

  /**
   * This keeps track of whether the application is loading data or not. This is used to
   * protect views from attempting to access details before they are loaded.
   */
  public isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public showHideHeader: Subject<boolean> = new Subject<boolean>();

  constructor(
    private unitRoleService: UnitRoleService,
    private unitService: UnitService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private projectService: ProjectService,
    private campusService: CampusService,
    private teachingPeriodService: TeachingPeriodService,
    @Inject(UIRouter) private router: UIRouter,
    private alerts: AlertService,
    private mediaObserver: MediaObserver,
  ) {
    this.loadedUnitRoles = this.unitRoleService.cache;
    this.loadedUnits = this.unitService.cache;
    this.currentUserProjects = this.projectService.cache;

    this.authenticationService.checkUserCookie();

    setTimeout(() => {
      if (this.authenticationService.isAuthenticated()) {
        this.loadGlobals();
      } else {
        // not loading anything as no user - just redirect to sign in
        this.isLoadingSubject.next(false);
        this.router.stateService.go('sign_in');
      }
    }, 800);

    // this is a hack to workaround horrific IOS "feature"
    // https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser

    window.addEventListener('orientationchange', this.resetHeight.bind(this));
    window.addEventListener('resize', this.resetHeight.bind(this));
    this.resetHeight();
  }

  private resetHeight() {
    setTimeout(() => {
      const vh = window.innerHeight * 0.01;

      if (!this.mediaObserver.isActive('gt-sm') || !this._showFooter) {
        document.body.style.setProperty('--vh', `${vh - 0.2}px`);
      } else {
        if (this._showFooter && !this._showFooterWarning) {
          document.body.style.setProperty('--vh', `${vh - 0.85}px`);
        } else {
          document.body.style.setProperty('--vh', `${vh - 0.85 - 0.2}px`);
        }
      }
    }, 0);
  }

  public get isInboxState(): boolean {
    return this._showFooter;
  }

  public setInboxState() {
    this._showFooter = true;
    // set background color to white
    document.body.style.setProperty('background-color', '#f5f5f5');
  }

  public goHome() {
    this.showHeader();
    document.body.style.setProperty('background-color', '#f5f5f5');
  }

  public setNotInboxState() {
    this._showFooter = false;
    // set background color to white
    document.body.style.setProperty('background-color', '#fff');
  }

  public showFooter(): void {
    this._showFooter = true;
    this.resetHeight();
  }

  public hideFooter(): void {
    this._showFooter = false;
    this.resetHeight();
  }

  // called when we need to set the footer to be a bit taller
  // to account for the alert div
  public showFooterWarning(): void {
    if (!this._showFooter) return;
    this._showFooterWarning = true;
    this.resetHeight();
  }

  // called when we need to set the footer to be normal sized
  public hideFooterWarning(): void {
    if (!this._showFooter) return;
    this._showFooterWarning = false;
    this.resetHeight();
  }

  public signOut(): void {
    // Show loading splash, and clear data.
    this.isLoadingSubject.next(true);
    this.userService.cache.clear();
    this.clearUnitsAndProjects();
    this.authenticationService.signOut();
    this.isLoadingSubject.next(false);
    this.router.stateService.go('sign_in');
  }

  public ngOnDestroy(): void {
    this.isLoadingSubject.complete();
    this.showHideHeader.complete();
    this.currentViewAndEntitySubject$.complete();
  }

  public loadGlobals(): void {
    this.isLoadingSubject.next(true);

    // Loading observer watches for loading of campuses, and teaching periods before loading unit roles, and projects
    const loadingObserver = new Observable((subscriber) => {
      // Loading campuses
      this.campusService.query().subscribe({
        next: (_reponse) => {
          subscriber.next(true);
        },
        error: (_response) => {
          this.alerts.error('Unable to access service. Failed loading campuses.', 6000);
        },
      });

      // Loading teaching periods
      this.teachingPeriodService.query().subscribe({
        next: (_response) => {
          subscriber.next(true);
        },
        error: (_response) => {
          this.alerts.error('Unable to access service. Failed loading teaching periods.', 6000);
        },
      });
    });

    // Watch for load of campuses and teaching periods, then trigger loading of unit roles and projects
    loadingObserver.pipe(skip(1), take(1)).subscribe({
      next: () => {
        // trigger loading of units and projects - this will end the loading when complete
        this.loadUnitsAndProjects();
      },
    });
  }

  /**
   * Query the API for the units taught and studied by the current user.
   */
  private loadUnitsAndProjects() {
    this.unitRoleService.query().subscribe({
      next: (_unitRoles: UnitRole[]) => {
        // unit roles are now in the cache

        this.projectService.query(undefined, {params: {include_in_active: false}}).subscribe({
          next: (_projects: Project[]) => {
            // projects updated in cache

            setTimeout(() => {
              this.isLoadingSubject.next(false);
            }, 800);
          },
          error: (_response) => {
            this.alerts.error('Unable to access the units you study.', 6000);
          },
        });
      },
      error: (_response) => {
        this.alerts.error('Unable to access your units.', 6000);
      }
    });
  }

  /**
   * The passed in function is called after the global user data is loaded.
   * This is only called once, and then the subscription is removed.
   *
   * @param run the function to run
   */
  public onLoad(run: () => void): void {
    const subscription = this.isLoadingSubject.subscribe((loading: boolean) => {
      // Only when the subject changes to "not loading"
      if (!loading) {
        run();
        setTimeout(() => subscription.unsubscribe());
      }
    });
  }

  /**
   * Clear all of the project and unit role data on sign out
   */
  public clearUnitsAndProjects(): void {
    this.loadedUnits.clear();
    this.loadedUnitRoles.clear();
    this.userService.cache.clear();
    this.currentUserProjects.clear();
  }

  /**
   * Switch to a new view, and its associated entity object
   */
  public setView(kind: ViewType, entity?: Project | Unit | UnitRole): void {
    this.currentViewAndEntitySubject$.next({viewType: kind, entity: entity});
  }

  /**
   * Show the header
   */
  public showHeader(): void {
    this.showHideHeader.next(true);
  }

  /**
   * Show the header
   */
  public hideHeader(): void {
    this.showHideHeader.next(false);
  }
}
