import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tasksOfTaskDefinition'
})
export class TasksOfTaskDefinitionPipe implements PipeTransform {

  transform(tasks, taskDefinition): any[] {
    if (!((taskDefinition) && (tasks))) {
      return tasks;
    }
    return tasks = tasks.filter({ task_definition_id: taskDefinition.id });
  }
}
