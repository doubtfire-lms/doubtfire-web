import {GroupSet, Task} from 'src/app/api/models/doubtfire-model';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'tasksForGroupset',
  standalone: false,
})
export class TasksForGroupsetPipe implements PipeTransform {
  transform(tasks: Task[], groupSet: GroupSet): Task[] {
    if (!tasks) return tasks;

    return tasks.filter((task) => {
      return task.definition.groupSet === groupSet || (!task.definition.groupSet && !groupSet);
    });
  }
}
