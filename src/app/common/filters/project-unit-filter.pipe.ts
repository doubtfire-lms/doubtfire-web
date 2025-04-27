import {Pipe, PipeTransform} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import _ from 'lodash';

@Pipe({
  name: 'projectUnitFilter',
})
export class ProjectUnitFilterPipe implements PipeTransform {
  transform(input: Project[] | null | undefined, text: string): Project[] {
    if (_.isString(text) && text.length > 0 && input) {
      const matchText = text.toLowerCase();
      return _.filter(input, (project) => {
        if (project && project.unit) {
          return project.unit.matches(matchText);
        }
        return false;
      });
    }
    return input || [];
  }
}
