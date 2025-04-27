import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'studentsWithPlagiarism',
})
export class StudentsWithPlagiarismPipe implements PipeTransform {
  transform(input: any[]): any[] {
    if (!input) {
      return input;
    }

    return input.filter((student) => student?.similarityFlag);
  }
}
