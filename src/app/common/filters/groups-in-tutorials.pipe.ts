import {Pipe, PipeTransform} from '@angular/core';
import {Group} from 'src/app/api/models/groups/group';
import {UnitRole} from 'src/app/api/models/unit-role';

@Pipe({
  name: 'groupsInTutorials',
})
export class GroupsInTutorialsPipe implements PipeTransform {
  transform(
    input: Group[] | null | undefined,
    unitRole: UnitRole | null | undefined,
    kind: string,
  ): Group[] | null {
    if (!input || !unitRole || !kind) {
      return input;
    }

    if (kind === 'mine') {
      return input.filter((group) => group.tutorial.tutor.id === unitRole.user.id);
    }

    return input;
  }
}
