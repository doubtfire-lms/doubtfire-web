import { Inject, Injectable } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { BehaviorSubject, Subject } from 'rxjs';
import { auth, projectService, unitService } from 'src/app/ajs-upgraded-providers';

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
   * A Unit Role for when a tutor is viewing a Project.
   */
  public unitRoleSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * The current activity, ie. Dashboard, Task Inbox, etc. Mostly used to be able to set the task dropdown
   */
  public currentActivitySubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * The list of all of the units taught by the current user
   */
  public unitRolesSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * The list of all of the units studied by the current user
   */
  public projectsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public showHideHeader: Subject<boolean> = new Subject<boolean>();

  constructor(
    @Inject(unitService) private UnitService: any,
    @Inject(projectService) private ProjectService: any,
    @Inject(auth) private Auth: any,
    @Inject(UIRouter) private router: UIRouter
  ) {
    setTimeout(() => {
      if (this.Auth.isAuthenticated()) {
        console.log('GSS is auth, loading units and projects');
        this.loadUnitsAndProjects();

        setTimeout(() => {
          this.isLoadingSubject.next(false);
        }, 2000);
      } else {
        console.log('GSS is not auth, going to sign in');
        this.router.stateService.go('sign_in');
      }
    }, 1000);
  }

  /**
   * Query the API for the units taught and studied by the current user.
   */
  public loadUnitsAndProjects() {
    //TODO: Consider sequence here? Can we adjust to fail once.
    this.UnitService.getUnitRoles((roles: any) => {
      this.unitRolesSubject.next(roles);

      this.ProjectService.getProjects(false, (projects: any) => {
        this.projectsSubject.next(projects);
      });
    });
  }

  /**
   * Clear all of the project and unit role data on sign out
   */
  public clearUnitsAndProjects() {
    this.unitRolesSubject.next(null);
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
