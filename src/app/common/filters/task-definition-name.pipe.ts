import {Pipe, PipeTransform} from '@angular/core';
import {TaskDefinition} from '../../api/models/doubtfire-model';

@Pipe({
  name: 'taskDefinitionName',
  standalone: false,
})
export class TaskDefinitionNamePipe implements PipeTransform {
  transform(taskDefinitions: readonly TaskDefinition[], searchName: string): TaskDefinition[] {
    searchName = searchName.toLowerCase();
    return taskDefinitions.filter((td) => {
      return (
        td?.name.toLowerCase().includes(searchName) ||
        td?.abbreviation.toLowerCase().includes(searchName) ||
        td?.targetGradeText.toLowerCase().includes(searchName)
      );
    });
  }
}
