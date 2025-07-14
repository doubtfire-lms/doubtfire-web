import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'localizedDateTime',
})
export class LocalizedDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    return new Date(value).toLocaleString();
  }
}
