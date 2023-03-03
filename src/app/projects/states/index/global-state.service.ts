import { Inject, Injectable, OnDestroy } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { UIRouter } from '@uirouter/angular';
import { EntityCache } from 'ngx-entity-service';
import { BehaviorSubject, Observable, Subject, skip, take } from 'rxjs';
import { alertService } from 'src/app/ajs-upgraded-providers';
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
import { AuthenticationService } from 'src/app/api/services/authentication.service';

export class DoubtfireViewState {
  public EntityObject: any; // Unit | Project | undefined
  public EntityType: 'unit' | 'project' | 'other' = 'other';
}

export enum ViewType {
  UNIT = 'UNIT',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
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
  public currentViewAndEntitySubject: BehaviorSubject<{ viewType: ViewType; entity: Project | Unit | UnitRole }> =
    new BehaviorSubject<{
      viewType: ViewType;
      entity: Project | Unit | UnitRole;
    } | null>(null);

  /**
   * The unit roles loaded from the server
   */
  public loadedUnitRoles: EntityCache<UnitRole>;

  /**
   * The loaded units.
   */
  private loadedUnits: EntityCache<Unit>;

  /**
   * The loaded projects.
   */
  private currentUserProjects: EntityCache<Project>;
  private footer = false;

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
    @Inject(alertService) private alerts: any,
    private mediaObserver: MediaObserver
  ) {
    this.loadedUnitRoles = this.unitRoleService.cache;
    this.loadedUnits = this.unitService.cache;
    this.currentUserProjects = this.projectService.cache;

    this.authenticationService.checkUserCookie();

    setTimeout(() => {
      if (this.authenticationService.isAuthenticated()) {
        this.loadGlobals();
      } else {
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
      if (this.footer && this.mediaObserver.isActive('gt-sm')) {
        document.body.style.setProperty('--vh', `${vh - 0.85}px`);
      } else {
        document.body.style.setProperty('--vh', `${vh - 0.2}px`);
      }
    }, 0);
  }

  public get isInboxState(): boolean {
    return this.footer;
  }

  public setInboxState() {
    console.log('isInboxState');
    this.footer = true;
    // set background color to white
    document.body.style.setProperty('background-color', '#f5f5f5');
  }

  public goHome() {
    this.showHeader();
    document.body.style.setProperty('background-color', '#f5f5f5');
  }
  public setNotInboxState() {
    console.log('notInboxState');
    this.footer = false;
    // set background color to white
    document.body.style.setProperty('background-color', '#fff');
  }

  public showFooter(): void {
    this.footer = true;
    this.resetHeight();
  }

  public hideFooter(): void {
    this.footer = false;
    this.resetHeight();
  }

  public signOut(): void {
    this.isLoadingSubject.next(true);
    this.userService.cache.clear();
    this.clearUnitsAndProjects();
    this.authenticationService.signOut();
    this.router.stateService.go('sign_in');
  }

  public ngOnDestroy(): void {
    this.isLoadingSubject.complete();
    this.showHideHeader.complete();
    this.currentViewAndEntitySubject.complete();
  }

  public loadGlobals(): void {
    const loadingObserver = new Observable((subscriber) => {
      // Loading campuses
      this.campusService.query().subscribe({
        next: (reponse) => {
          subscriber.next(true);
        },
        error: (response) => {
          this.alerts.add('danger', 'Unable to access service. Failed loading campuses.', 6000);
        },
      });

      // Loading teaching periods
      this.teachingPeriodService.query().subscribe({
        next: (response) => {
          subscriber.next(true);
        },
        error: (response) => {
          this.alerts.add('danger', 'Unable to access service. Failed loading teaching periods.', 6000);
        },
      });
    });

    loadingObserver.pipe(skip(1), take(1)).subscribe({
      next: () => {
        this.loadUnitsAndProjects();
      },
    });
  }

  /**
   * Query the API for the units taught and studied by the current user.
   */
  private loadUnitsAndProjects() {
    this.unitRoleService.query().subscribe({
      next: (unitRoles: UnitRole[]) => {
        // unit roles are now in the cache

        this.projectService.query(undefined, { params: { include_inactive: false } }).subscribe({
          next: (projects: Project[]) => {
            // projects updated in cache

            setTimeout(() => {
              this.isLoadingSubject.next(false);
            }, 800);
          },
        });
      },
    });
  }

  public onLoad(run: () => void): void {
    const subscription = this.isLoadingSubject.subscribe((loading: boolean) => {
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
  public setView(kind: ViewType, entity?: any): void {
    this.currentViewAndEntitySubject.next({ viewType: kind, entity: entity });
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
