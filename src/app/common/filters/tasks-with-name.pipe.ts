import {Pipe, PipeTransform} from '@angular/core';
import {Task} from 'src/app/api/models/task';

@Pipe({
  name: 'tasksWithName',
})
export class TasksWithNamePipe implements PipeTransform {
  transform(tasks: Task[], searchName: string): any[] {
    if (!searchName || !tasks || searchName.length === 0) {
      return tasks;
    }

    const lowercasedSearchName = searchName.toLowerCase();

    return tasks.filter(
      (task) =>
        task.definition.name.toLowerCase().includes(lowercasedSearchName) ||
        task.definition.abbreviation.toLowerCase().includes(lowercasedSearchName),
    );
  }
}
