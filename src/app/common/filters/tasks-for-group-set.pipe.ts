import {Pipe, PipeTransform} from '@angular/core';
import {GroupSet, Task} from 'src/app/api/models/doubtfire-model';

@Pipe({name: 'tasksForGroupset'})
export class TasksForGroupsetPipe implements PipeTransform {
  transform(tasks: readonly Task[], groupSet: GroupSet): Task[] {
    if (!tasks) {
      return [];
    }

    return tasks.filter((task) => {
      return task.definition.groupSet === groupSet || (!task.definition.groupSet && !groupSet);
    });
  }
}
