import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'filters'})
export class FiltersPipe implements PipeTransform {
  transform(_value: unknown, ..._args: unknown[]): unknown {
    return null;
  }
}
