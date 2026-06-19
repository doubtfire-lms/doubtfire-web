import {MediaObserver} from 'ng-flex-layout';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'unit-dropdown',
  templateUrl: './unit-dropdown.component.html',
  styleUrls: ['./unit-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitDropdownComponent {
  @Input() unitRoles: UnitRole[];
  @Input() projects: Project[];
  @Input() unit: Unit;

  unitTitle: string;

  constructor(public media: MediaObserver) {}
}
