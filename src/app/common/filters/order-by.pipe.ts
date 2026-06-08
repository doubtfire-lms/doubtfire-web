import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'orderBy',
  standalone: false,
})
export class OrderByPipe implements PipeTransform {
  transform<T extends Record<string, string | number>>(
    array: T[],
    field: keyof T,
    reverse: boolean = false,
  ): T[] {
    if (!array || !field) {
      return array;
    }

    const sortedArray = [...array].sort((a, b) => {
      if (a[field] < b[field]) {
        return -1;
      }
      if (a[field] > b[field]) {
        return 1;
      }
      return 0;
    });

    if (reverse) {
      return sortedArray.reverse();
    }

    return sortedArray;
  }
}
