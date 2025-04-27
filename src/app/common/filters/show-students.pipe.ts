import {Pipe, PipeTransform} from '@angular/core';
import {User} from 'src/app/api/models/doubtfire-model';
import {Project} from 'src/app/api/models/project';

@Pipe({
  name: 'showStudents',
})
export class ShowStudentsPipe implements PipeTransform {
  transform(input: Project[], kind: string, tutor: User): any[] {
    if (!input) {
      return input;
    }

    if (kind === 'mine' || kind === 'myStudents') {
      return input.filter((project) => project.hasTutor(tutor));
    } else {
      return input;
    }
  }
}
