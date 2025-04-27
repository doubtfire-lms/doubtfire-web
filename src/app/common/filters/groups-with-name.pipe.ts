import {Pipe, PipeTransform} from '@angular/core';
import {Group} from 'src/app/api/models/groups/group';

@Pipe({
  name: 'groupsWithName',
})
export class GroupsWithNamePipe implements PipeTransform {
  transform(
    input: Group[] | null | undefined,
    searchName: string | null | undefined,
  ): Group[] | null {
    if (!searchName || !input) {
      return input;
    }

    searchName = searchName.toLowerCase();

    return input.filter((group) => group.name.toLowerCase().includes(searchName));
  }
}
