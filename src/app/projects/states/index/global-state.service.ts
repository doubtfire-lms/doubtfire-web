import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  unitRole: any;
  unitRoleChange: Observable<any>;
  unitRoleChangeObserver: Observer<any>;

  project: any;
  projectChange: Observable<any>;
  projectChangeObserver: Observer<any>;

  constructor() {
    this.unitRoleChange = new Observable((observer: Observer<any>) => {
      this.unitRoleChangeObserver = observer;
    });
    this.projectChange = new Observable((observer: Observer<any>) => {
      this.projectChangeObserver = observer;
    });
  }

  public setUnitRole(unitRole: any) {
    this.unitRole = unitRole;
    this.unitRoleChangeObserver.next(this.unitRole);
  }

  public setProject(project: any) {
    console.log(project)
    this.project = project;
    this.projectChangeObserver.next(this.project);
  }
}
