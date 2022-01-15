import { Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';

@Pipe({
  name: 'marked',
})
export class MarkedPipe implements PipeTransform {
  // Set the options for the markdown renderer
  constructor() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      pedantic: false,
      gfm: true,
      breaks: false,
      smartLists: true,
      smartypants: false,
      xhtml: false,
    });
  }

  transform(value: string, ...args: any[]): string {
    if (value && value.length > 0) {
      return marked.marked(value);
    }
    return value;
  }
}
