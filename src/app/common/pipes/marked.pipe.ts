import * as marked from 'marked';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'marked',
  standalone: false,
})
export class MarkedPipe implements PipeTransform {
  // Set the options for the markdown renderer
  constructor() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      pedantic: false,
      gfm: true,
      breaks: true,
    });
  }

  transform(value: string): string {
    if (value && value.length > 0) {
      return marked.parse(value.replaceAll(/\r\n|\r|\n/g, '<br />'), {async: false}) as string;
    }
    return value;
  }
}
