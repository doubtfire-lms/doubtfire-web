import {Component, Input, OnInit} from '@angular/core';
import {Project, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {MediaObserver} from 'ng-flex-layout';

@Component({
  selector: 'unit-dropdown',
  templateUrl: './unit-dropdown.component.html',
  styleUrls: ['./unit-dropdown.component.scss'],
})
export class UnitDropdownComponent implements OnInit {
  @Input() unitRoles: UnitRole[];
  @Input() projects: Project[];
  @Input() unit: Unit;

  unitTitle: string;

  constructor(public media: MediaObserver) {}

  ngOnInit(): void {}
}
