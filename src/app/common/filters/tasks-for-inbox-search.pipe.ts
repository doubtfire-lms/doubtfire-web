import { Pipe, PipeTransform } from '@angular/core';
import { any } from '@uirouter/angular';

@Pipe({
  name: 'tasksWithStudentName'
})
export class TasksForInboxSearchPipe implements PipeTransform {

  transform(tasks, searchText): any[] {
    if ((searchText == null) || (tasks == null)) { return tasks; }
    searchText = searchText.toLowerCase();
    // return tasks.filter(task => task.project().name.toLowerCase().indexOf(searchText) >= 0);

    return tasks.filter( (task: { project: () => any; }) =>
      {
        const p: any = task.project();
        return p.matches(searchText);
      }
    );
  }
}
