import { Pipe, PipeTransform } from '@angular/core';
import { UnitRole } from 'src/app/api/models/unit-role';

@Pipe({
  name: 'isActiveUnitRole',
})
export class IsActiveUnitRole implements PipeTransform {
  transform(array: UnitRole[], ...args: any[]): UnitRole[] {
    if (array == null) {
      return;
    }
    return array.filter((ur) => ur.unit?.active);
  }
}
