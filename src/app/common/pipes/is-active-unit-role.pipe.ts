import {UnitRole} from 'src/app/api/models/unit-role';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'isActiveUnitRole',
  standalone: false,
})
export class IsActiveUnitRole implements PipeTransform {
  transform(array: UnitRole[], ..._args: any[]): UnitRole[] {
    if (array == null) {
      return;
    }
    return array.filter((ur) => ur.unit?.active);
  }
}
