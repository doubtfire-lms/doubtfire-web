
import { Pipe, PipeTransform } from '@angular/core';
import { TaskDefinition } from '../../api/models/doubtfire-model';

@Pipe({
  name: 'taskDefinitionName',
})
export class TaskDefinitionNamePipe implements PipeTransform {
  transform(taskDefinitions: TaskDefinition[], searchName: string): TaskDefinition[] {
    searchName = searchName.toLowerCase();
    return taskDefinitions.filter( // use lodash filter?
      (td) => {
        return td.name.toLowerCase().indexOf(searchName) >= 0 ||
          td.abbreviation.toLowerCase().indexOf(searchName) >= 0 ||
          td.targetGradeText.toLowerCase().indexOf(searchName) >= 0
      }
    )
  }
}
