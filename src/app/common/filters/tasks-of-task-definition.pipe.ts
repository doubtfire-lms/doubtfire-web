import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tasksOfTaskDefinition'
})
export class TasksOfTaskDefinitionPipe implements PipeTransform {

  transform(tasks, taskDefinition): any[] {
    if ((taskDefinition == null) || (tasks == null)) {
      return tasks;
    }
    return tasks.filter(task => task?.task_definition_id === taskDefinition.id);
  }
}
