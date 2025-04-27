import {Pipe, PipeTransform} from '@angular/core';
import {Task} from 'src/app/api/models/task';

@Pipe({
  name: 'tasksWithStatuses',
})
export class TasksWithStatusesPipe implements PipeTransform {
  transform(tasks: Task[] | null | undefined, statusKeys: string[]): Task[] {
    if (!tasks) {
      return [];
    }

    if (!statusKeys || statusKeys.length === 0) {
      return tasks;
    }

    return tasks.filter((task) => statusKeys.includes(task.status));
  }
}
