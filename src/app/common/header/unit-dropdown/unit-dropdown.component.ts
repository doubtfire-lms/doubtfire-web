import { Component, Inject, Input, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { dateService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'unit-dropdown',
  templateUrl: './unit-dropdown.component.html',
  styleUrls: ['./unit-dropdown.component.scss'],
})
export class UnitDropdownComponent implements OnInit {
  @Input() unitRoles: any;
  @Input() projects: any;
  @Input() unit: any;
  unitTitle: string;
  constructor(@Inject(dateService) private DateService: any) {}

  ngOnInit(): void {}

  showDate = this.DateService.showDate;
}
