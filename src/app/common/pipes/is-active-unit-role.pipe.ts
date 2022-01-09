import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isActiveUnitRole',
})
export class IsActiveUnitRole implements PipeTransform {
  transform(value: any, ...args: unknown[]): any[] {
    if (value == null) {
      return;
    }
    const array = [...value];
    return array.filter((ur) => ur.active);
  }
}
