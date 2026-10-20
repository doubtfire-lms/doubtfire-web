import {Pipe, PipeTransform} from '@angular/core';
import {Task, UnitRole} from '../../api/models/doubtfire-model';

@Pipe({
  name: 'tasksByTutor',
  standalone: false,
})
export class TasksByTutorPipe implements PipeTransform {
  transform(currentUnitRole: UnitRole, tasks: Task[], unitRoleId?: number | string): Task[] {
    if (!tasks) {
      return tasks;
    }

    if (!unitRoleId || unitRoleId === 'all') {
      return tasks;
    }

    if (unitRoleId === 'mentoring_all') {
      if (!currentUnitRole) {
        return [];
      }

      return tasks.filter((task) => task.tutor?.mentorId === currentUnitRole.id);
    }

    return tasks.filter((task) => task.tutor?.id === unitRoleId);
  }
}
