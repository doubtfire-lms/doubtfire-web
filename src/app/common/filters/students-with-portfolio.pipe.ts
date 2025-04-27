import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'studentsWithPortfolio',
})
export class StudentsWithPortfolioPipe implements PipeTransform {
  transform(input: any[], option: string): any[] {
    if (!input) {
      return input;
    }

    return input.filter((student) => option === 'allStudents' || student?.hasPortfolio > 0);
  }
}
