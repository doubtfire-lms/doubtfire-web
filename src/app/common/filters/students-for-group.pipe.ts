import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'studentsForGroup',
})
export class StudentsForGroupPipe implements PipeTransform {
  transform(input: any[], gs: any, group: any, members: any[]): any[] {
    if (!input) {
      return input;
    }

    if (gs.keepGroupsInSameClass) {
      return input.filter(
        (student) =>
          student?.isEnrolledIn(group.tutorial) && !members.some((mbr) => student.id === mbr.id),
      );
    } else {
      return input.filter((student) => !members.some((mbr) => student.id === mbr.id));
    }
  }
}
