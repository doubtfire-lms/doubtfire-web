import {Pipe, PipeTransform} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';

@Pipe({
  name: 'taskForPortfolio',
})
export class TaskForPortfolioPipe implements PipeTransform {
  constructor(private taskService: TaskService) {}

  transform(input: Task[] | null | undefined, apply: boolean): Task[] {
    if (!apply || !input) {
      return input || [];
    }

    return input.filter((task) => {
      if (task) {
        return !this.taskService.toBeWorkedOn.includes(task.status);
      }
      return false;
    });
  }
}
