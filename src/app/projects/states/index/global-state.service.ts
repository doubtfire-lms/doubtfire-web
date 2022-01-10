import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  public unitRole: Subject<any> = new Subject<any>();
  public project: Subject<any> = new Subject<any>();

  constructor() {}

  public setUnitRole(unitRole: any) {
    this.unitRole.next(unitRole);
  }

  public setProject(project: any) {
    this.project.next(project);
  }
}
