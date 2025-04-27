import {Pipe, PipeTransform} from '@angular/core';
import {Task} from 'src/app/api/models/task';

@Pipe({
  name: 'tasksWithSearchText',
})
export class TasksWithSearchTextPipe implements PipeTransform {
  transform(tasks: Task[] | null | undefined, searchText: string | null | undefined): Task[] {
    if (!searchText || !tasks) {
      return tasks || [];
    }

    const lowercasedSearchText = searchText.toLowerCase();

    return tasks.filter((task) => {
      const project = task.project;
      return project && project.matches(lowercasedSearchText);
    });
  }
}
