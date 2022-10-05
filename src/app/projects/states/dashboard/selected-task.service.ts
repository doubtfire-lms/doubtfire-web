import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Task } from 'src/app/api/models/task';
import { TaskService } from 'src/app/api/services/task.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedTaskService {
  constructor(private taskService: TaskService) {}

  private task$ = new BehaviorSubject<Task>(null);

  public setSelectedTask(task: number | Task) {
    if (typeof task === 'number') {
      this.taskService.get(task).subscribe(this.task$);
    } else {
      this.task$.next(task);
    }
    // this.task$.next(this.taskService.get(id));
  }

  public get selectedTask$(): Subject<Task> {
    return this.task$;
  }
}
