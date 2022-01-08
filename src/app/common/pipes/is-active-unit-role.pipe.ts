import { Pipe, PipeTransform } from '@angular/core';
import { unitServiceProvider } from 'src/app/ajs-upgraded-providers';

@Pipe({
  name: 'isActiveUnitRole',
})
export class IsActiveUnitRole implements PipeTransform {
  transform(value: any, ...args: unknown[]): unknown {
    if (value == null) {
      return;
    }
    const array = [...value];
    return array.filter(ur => ur.active);

  }
}
