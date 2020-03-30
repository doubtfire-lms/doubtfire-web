import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'humanizedDate'
})
export class HumanizedDatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    if (value == null) {
      return;
    }
    return moment(value).calendar(null, {
      sameDay: '',
      nextDay: '[tomorrow]',
      nextWeek: '[this] dddd',
      lastDay: '[yesterday]',
      lastWeek: '[last] dddd',
      sameElse: 'DD/MM/YYYY'
    });
  }
}
