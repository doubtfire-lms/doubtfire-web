import { Pipe, PipeTransform } from '@angular/core';
import { Task, GroupSet } from 'src/app/api/models/doubtfire-model';

@Pipe({
  name: 'tasksForGroupset'
})
export class TasksForGroupsetPipe implements PipeTransform {
  transform(tasks: Task[], groupSet: GroupSet): Task[] {
    if (!tasks) return tasks;

    return tasks.filter(task => {
      return (task.definition.groupSet === groupSet) || (!task.definition.groupSet && !groupSet);
    });
  }
}
