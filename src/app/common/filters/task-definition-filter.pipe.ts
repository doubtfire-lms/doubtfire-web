import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'taskDefinitionFilter',
})
export class TaskDefinitionFilterPipe implements PipeTransform {
  transform(input: any[], taskDefId: string): any[] {
    if (!input || !taskDefId) {
      return input;
    }

    return input.filter((item) => item?.definition?.id === taskDefId);
  }
}
