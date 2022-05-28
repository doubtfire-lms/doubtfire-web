import { Inject, Injectable } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { EntityCache } from 'ngx-entity-service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { auth, oldUnitService, projectService } from 'src/app/ajs-upgraded-providers';
import { Unit, UnitRole, UnitRoleService, UnitService, UserService } from 'src/app/api/models/doubtfire-model';

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
export class GlobalStateService {
  /**
   * The current view and entity, indicating what kind of page is being shown.
   */
  public currentViewAndEntitySubject: BehaviorSubject<{ viewType: ViewType; entity: {} }> = new BehaviorSubject<{
    viewType: ViewType;
    entity: {};
  } | null>(null);

  /**
   * The unit roles loaded from the server
   */
   private loadedUnitRoles: EntityCache<UnitRole>;

  /**
   * The loaded units.
   */
  private loadedUnits: EntityCache<Unit>;

  /**
   * A Unit Role for when a tutor is viewing a Project.
   */
  // public get unitRoleSubject(): Observable<UnitRole>;

  /**
   * The current activity, ie. Dashboard, Task Inbox, etc. Mostly used to be able to set the task dropdown
   */
  public currentActivitySubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * The list of all of the units taught by the current user
   */
  public get unitRolesSubject(): Observable<UnitRole[]> {
    return this.loadedUnitRoles.values;
  }

  /**
   * The list of all of the units studied by the current user
   */
  public projectsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public showHideHeader: Subject<boolean> = new Subject<boolean>();

  constructor(
    private unitRoleService: UnitRoleService,
    private unitService: UnitService,
    private userService: UserService,
    @Inject(projectService) private ProjectService: any,
    @Inject(auth) private Auth: any,
    @Inject(UIRouter) private router: UIRouter
  ) {
    this.loadedUnitRoles = this.unitRoleService.cache;
    this.loadedUnits = this.unitService.cache;

    setTimeout(() => {
      if (this.Auth.isAuthenticated()) {
        this.loadUnitsAndProjects();
      } else {
        this.router.stateService.go('sign_in');
      }
    }, 800);
  }

  public signOut() {
    this.clearUnitsAndProjects();
    this.Auth.signOut();
    this.router.stateService.go('sign_in');
  }

  /**
   * Query the API for the units taught and studied by the current user.
   */
  public loadUnitsAndProjects() {

    //TODO: Consider sequence here? Can we adjust to fail once.
    this.unitRoleService.query().subscribe(
      {
        next: (unitRoles: UnitRole[]) => {
          console.log(unitRoles);

          this.ProjectService.getProjects(false, (projects: any) => {
            this.projectsSubject.next(projects);

            setTimeout(() => {
              this.isLoadingSubject.next(false);
            }, 800);
          });
        }
      }
    );
  }

  public onLoad(run: () => void) {
    const subscription = this.isLoadingSubject.subscribe(
      (loading: boolean) => {
        if ( !loading ) {
          run();
          subscription.unsubscribe();
        }
      }
    )
  }

  /**
   * Clear all of the project and unit role data on sign out
   */
  public clearUnitsAndProjects() {
    this.loadedUnits.clear();
    this.loadedUnitRoles.clear();
    this.userService.cache.clear();

    this.projectsSubject.next(null);
  }

  /**
   * Switch to a new view, and its associated entity object
   */
  public setView(kind: ViewType, entity?: any) {
    this.currentViewAndEntitySubject.next({ viewType: kind, entity: entity });
  }

  /**
   * Show the header
   */
  public showHeader() {
    this.showHideHeader.next(true);
  }

  /**
   * Show the header
   */
  public hideHeader() {
    this.showHideHeader.next(false);
  }
}
