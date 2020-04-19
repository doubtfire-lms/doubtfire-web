import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tasksWithStudentName'
})
export class TasksWithStudentNamePipe implements PipeTransform {

  transform(tasks, searchName): any[] {
    if ((searchName == null) || (tasks == null)) { return tasks; }
    searchName = searchName.toLowerCase();
    return tasks.filter(task => task.project().name.toLowerCase().indexOf(searchName) >= 0);
  }
}
