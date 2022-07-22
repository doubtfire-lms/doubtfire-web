import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskDefinition } from 'src/app/api/models/doubtfire-model';

@Pipe({
  name: 'tasksOfTaskDefinition',
})
export class TasksOfTaskDefinitionPipe implements PipeTransform {
  transform(tasks: Task[], taskDefinition: TaskDefinition): Task[] {
    if (taskDefinition == null || tasks == null) {
      return tasks;
    }
    return tasks.filter((task) => task?.definition.id === taskDefinition.id);
  }
}
