import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'studentsWithSubmittedGrade',
})
export class StudentsWithSubmittedGradePipe implements PipeTransform {
  transform(input: any[]): any[] {
    if (!input) {
      return input;
    }

    return input.filter((student) => student?.gradeSubmitted);
  }
}
