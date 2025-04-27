import {Pipe, PipeTransform} from '@angular/core';
import {Group} from 'src/app/api/models/groups/group';
import {GroupSet} from 'src/app/api/models/groups/group-set';
import {Project} from 'src/app/api/models/project';

@Pipe({
  name: 'groupsForStudent',
})
export class GroupsForStudentPipe implements PipeTransform {
  transform(
    input: Group[] | null | undefined,
    project: Project | null | undefined,
    groupSet: GroupSet | null | undefined,
  ): Group[] | null {
    if (!input || !groupSet || !project) {
      return input;
    }

    const grp = project.groupForGroupSet(groupSet);
    if (grp) {
      return [grp];
    }

    if (groupSet.keepGroupsInSameClass) {
      return input.filter((group) => project.isEnrolledIn(group.tutorial));
    }

    return input;
  }
}
