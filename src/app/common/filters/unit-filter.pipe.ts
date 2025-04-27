import {Pipe, PipeTransform} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import _ from 'lodash';

@Pipe({
  name: 'unitFilter',
})
export class UnitFilterPipe implements PipeTransform {
  transform(input: Unit[] | null | undefined, text: string): Unit[] {
    if (_.isString(text) && text.length > 0 && input) {
      const matchText = text.toLowerCase();
      return _.filter(input, (unit) => {
        if (unit && unit.matches) {
          return unit.matches(matchText);
        }
        return false;
      });
    }
    return input || [];
  }
}
