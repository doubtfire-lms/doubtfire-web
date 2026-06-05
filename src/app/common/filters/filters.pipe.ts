import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filters',
  standalone: false,
})
export class FiltersPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
