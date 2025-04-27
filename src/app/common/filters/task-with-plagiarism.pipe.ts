import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'taskWithPlagiarism',
})
export class TaskWithPlagiarismPipe implements PipeTransform {
  transform(input: any[]): any[] {
    if (!input) {
      return input;
    }

    return input.filter((task) => task?.similarityFlag);
  }
}
