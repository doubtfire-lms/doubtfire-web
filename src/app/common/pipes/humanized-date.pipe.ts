import moment from 'moment';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'humanizedDate',
  standalone: false,
})
export class HumanizedDatePipe implements PipeTransform {
  transform(value: unknown, ..._args: unknown[]): string {
    if (value == null) {
      return '';
    }
    return moment(value).calendar(null, {
      sameDay: '',
      nextDay: '[tomorrow]',
      nextWeek: '[this] dddd',
      lastDay: '[yesterday]',
      lastWeek: '[last] dddd',
      sameElse: 'DD/MM/YYYY',
    });
  }
}
