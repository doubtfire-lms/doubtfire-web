import {Component, Input} from '@angular/core';
import {GroupSet} from 'src/app/api/models/doubtfire-model';
import {Unit} from 'src/app/api/models/unit';
import {UnitRole} from 'src/app/api/models/unit-role';

// This component is only displayed to staff
// Students will be shown the projects/states/groups (project-groups) component
@Component({
  selector: 'f-unit-groups',
  templateUrl: './unit-groups.component.html',
  styleUrl: './unit-groups.component.scss',
})
export class UnitGroupsComponent {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() selectedGroupSet: GroupSet;
}
