import {Pipe, PipeTransform} from '@angular/core';
import {GroupSet} from 'src/app/api/models/groups/group-set';
import {Task} from 'src/app/api/models/task';

@Pipe({
  name: 'tasksForGroupset',
})
export class TasksForGroupsetPipe implements PipeTransform {
  transform(input: Task[] | null | undefined, groupSet: GroupSet): Task[] | null {
    if (!input) {
      return input;
    }

    return input.filter(
      (task) => task.definition.groupSet === groupSet || (!task.definition.groupSet && !groupSet),
    );
  }
}
