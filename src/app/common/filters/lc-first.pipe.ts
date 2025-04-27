import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'lcfirst',
})
export class LcfirstPipe implements PipeTransform {
  transform(input: string): string {
    if (!input || input.length === 0) {
      return input;
    }

    return input.charAt(0).toLowerCase() + input.slice(1);
  }
}
