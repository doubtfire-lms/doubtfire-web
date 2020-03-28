import { Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';

@Pipe({
  name: 'marked'
})
export class MarkedPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    if (value && value.length > 0) {
      return marked(value);
    }
    return value;
  }

}
