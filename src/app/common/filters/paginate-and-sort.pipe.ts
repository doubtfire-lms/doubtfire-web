import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'paginateAndSort',
})
export class PaginateAndSortPipe implements PipeTransform {
  transform(input: any[], pagination: any, tableSort: any): any[] {
    if (!input || !pagination || !tableSort) {
      return input;
    }

    if (input.length === 0) {
      return input;
    }

    pagination.show = input.length > pagination.pageSize;
    pagination.totalSize = input.length;

    const sortedInput = this.sort(input, tableSort);

    const paginatedInput = this.paginate(sortedInput, pagination);

    return paginatedInput;
  }

  private sort(input: any[], tableSort: any): any[] {
    return input.sort((a, b) => {
      const comparison =
        a[tableSort.order] < b[tableSort.order]
          ? -1
          : a[tableSort.order] > b[tableSort.order]
            ? 1
            : 0;
      return tableSort.reverse ? -comparison : comparison;
    });
  }

  private paginate(input: any[], pagination: any): any[] {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    return input.slice(startIndex, startIndex + pagination.pageSize);
  }
}
