import {Pipe, PipeTransform} from '@angular/core';
import {Task} from 'src/app/api/models/task';

@Pipe({
  name: 'statusFilter',
})
export class StatusFilterPipe implements PipeTransform {
  transform(input: Task[], statusKind: string): Task[] {
    if (!input || !statusKind) {
      return input;
    }

    return input.filter((task) => {
      if (statusKind === 'discuss') {
        return task.status === statusKind || task.status === 'demonstrate';
      } else {
        return task.status === statusKind;
      }
    });
  }
}
