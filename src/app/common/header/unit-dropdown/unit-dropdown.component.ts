import {MediaObserver} from 'ng-flex-layout';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDivider, MatListSubheaderCssMatStyler} from '@angular/material/list';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {Project, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {UnitCodeComponent} from '../../unit-code/unit-code.component';

@Component({
  selector: 'unit-dropdown',
  templateUrl: './unit-dropdown.component.html',
  styleUrls: ['./unit-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    UnitCodeComponent,
    MatTooltip,
    MatMenuTrigger,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    RouterLink,
    MatDivider,
    MatListSubheaderCssMatStyler,
  ],
})
export class UnitDropdownComponent {
  @Input() unitRoles: UnitRole[];
  @Input() projects: Project[];
  @Input() unit: Unit;

  unitTitle: string;

  constructor(public media: MediaObserver) {}
}
