import {Pipe, PipeTransform} from '@angular/core';
import {Task} from '../../api/models/doubtfire-model';

@Pipe({
  name: 'tasksByTutor',
})
export class TasksByTutorPipe implements PipeTransform {
  transform(tasks: Task[], unitRoleId?: number | string): Task[] {
    if (!tasks) return tasks;

    if (!unitRoleId || unitRoleId === 'all') return tasks;

    return tasks.filter((task) => task.tutor?.id === unitRoleId);
  }
}
