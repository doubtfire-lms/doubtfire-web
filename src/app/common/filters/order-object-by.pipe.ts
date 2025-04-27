import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'orderObjectBy',
})
export class OrderObjectByPipe implements PipeTransform {
  transform(items: any[], field: string, reverse: boolean = false): any[] {
    if (!items || items.length === 0) {
      return items; // Return the original array if it's empty or falsy
    }

    const filtered = [...items];

    filtered.sort((a, b) => {
      if (a[field] > b[field]) {
        return 1;
      } else if (a[field] < b[field]) {
        return -1;
      }
      return 0;
    });

    if (reverse) {
      filtered.reverse();
    }

    return filtered;
  }
}
