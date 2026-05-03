import {Component, Input} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';

@Component({
  selector: 'f-unit-groups',
  templateUrl: 'groups.component.html',
  styleUrls: ['groups.component.scss'],
})
export class UnitGroupsStateComponent {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
}
