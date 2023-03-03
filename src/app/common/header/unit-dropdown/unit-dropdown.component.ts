import { Component, Inject, Input, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { dateService } from 'src/app/ajs-upgraded-providers';
import { Project, Unit, UnitRole } from 'src/app/api/models/doubtfire-model';
import { MediaObserver } from '@angular/flex-layout';

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

  constructor(
    @Inject(dateService) private DateService: any,
    public media: MediaObserver
  ) {}

  ngOnInit(): void {}
}
