import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'orderBy',
  standalone: false,
})
export class OrderByPipe implements PipeTransform {
  transform<T>(array: readonly T[], field: string | string[], reverse: boolean = false): T[] {
    if (!array || !field) {
      return [];
    }

    const fields = Array.isArray(field) ? field : [field];
    const valueFor = (item: T, path: string): unknown =>
      path.split('.').reduce((value, key) => value?.[key], item);

    const sortedArray = [...array].sort((a, b) => {
      const aValue = valueFor(a, fields[0]);
      const bValue = valueFor(b, fields[0]);

      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
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
