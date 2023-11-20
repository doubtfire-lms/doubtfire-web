import { Pipe, PipeTransform } from '@angular/core';
import { Task } from 'src/app/api/models/task';

@Pipe({
  name: 'tasksWithStudentName',
})
export class TasksForInboxSearchPipe implements PipeTransform {
  transform(tasks: Task[], searchText: string): Task[] {
    if (searchText == null || tasks == null) {
      return tasks;
    }
    const searchTerms = searchText
      .toLowerCase()
      .split(/&|[|]|,/)
      .map((term) => term.trim());
    const operators = searchText.replace(/[^&|,]/g, '').split('');

    return tasks.filter((task: Task) =>
      searchTerms
        .map((term: string) => task.matches(term))
        .reduce((prev: boolean, current: boolean, currentIndex: number) =>
          operators[currentIndex - 1] === '&' ? prev && current : prev || current
        )
    );
  }
}
