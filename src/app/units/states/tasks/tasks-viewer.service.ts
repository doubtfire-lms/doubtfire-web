import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TaskDefinition } from 'src/app/api/models/task-definition';

@Injectable({
  providedIn: 'root'
})
export class TasksViewerService {

  selectedTaskDef = new Subject<TaskDefinition>();

  public setSelectedTaskDef(taskDef: TaskDefinition) {
    this.selectedTaskDef.next(taskDef);
  }

  constructor() { }
}
