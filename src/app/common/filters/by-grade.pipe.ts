import {Pipe, PipeTransform} from '@angular/core';
import {Task} from 'src/app/api/models/task';

@Pipe({
  name: 'byGrade',
})
export class ByGradePipe implements PipeTransform {
  transform(input: Task[], grade: number): any[] {
    if (!input || input.length === 0) {
      return input; // Return the original array if it's empty or falsy
    }

    // Filter the tasks based on the grade
    return input.filter((task) => task?.definition?.targetGrade <= grade);
  }
}
