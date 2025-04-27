import {Pipe, PipeTransform} from '@angular/core';
import {TeachingPeriod} from 'src/app/api/models/teaching-period';
import _ from 'lodash';

@Pipe({
  name: 'teachingPeriodFilter',
})
export class TeachingPeriodFilterPipe implements PipeTransform {
  transform(input: TeachingPeriod[] | null | undefined, text: string): TeachingPeriod[] {
    if (_.isString(text) && text.length > 0 && input) {
      const matchText = text.toLowerCase();
      return _.filter(input, (tp) => {
        if (tp && tp.period) {
          return tp.period.toLowerCase().indexOf(matchText) >= 0;
        }
        return false;
      });
    }
    return input || [];
  }
}
