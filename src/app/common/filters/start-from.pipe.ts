import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'startFrom',
})
export class StartFromPipe implements PipeTransform {
  transform(input: any[], start: number): any[] {
    if (!Array.isArray(input)) {
      return input;
    }
    return input.slice(+start);
  }
}
