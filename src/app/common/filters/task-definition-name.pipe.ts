import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskDefinition } from '../../api/models/doubtfire-model';

@Pipe({
  name: 'taskDefinitionName',
})
export class TaskDefinitionNamePipe implements PipeTransform {
  transform(taskDefinitions: TaskDefinition[], searchName: string): TaskDefinition[] {
    searchName = searchName.toLowerCase();
    return taskDefinitions.filter( // use lodash filter?
      (td) => {
        return (
          td?.name.toLowerCase().includes(searchName) ||
          td?.abbreviation.toLowerCase().includes(searchName) ||
          td?.targetGradeText.toLowerCase().includes(searchName)
        );
      },
    );
  }
}
