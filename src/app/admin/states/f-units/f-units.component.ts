import { createUnitModal } from 'src/app/ajs-upgraded-providers';
import { Component, Input, Inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface PeriodicElement {
  unit_code: string;
  name: string;
  unit_role: string; // we might can use enum here, but let's keep it simple for now
  teaching_period: string; // we might can use enum here, but let's keep it simple for now
  start_date: string;
  end_date: string;
  active: boolean;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    unit_code: 'COS30243',
    name: 'Game Programming',
    unit_role: 'Convenor',
    teaching_period: 'Custom',
    start_date: 'Mon 28 Aug 2023',
    end_date: 'Mon 27 Nov 2023',
    active: true,
  },
  {
    unit_code: 'COS30046',
    name: 'Artificial Intelligence for Games',
    unit_role: 'Convenor',
    teaching_period: 'Custom',
    start_date: 'Mon 28 Aug 2023',
    end_date: 'Mon 27 Nov 2023',
    active: true,
  },
  {
    unit_code: 'COS20007',
    name: 'Object Oriented Programming',
    unit_role: 'Convenor',
    teaching_period: 'Custom',
    start_date: 'Mon 28 Aug 2023',
    end_date: 'Mon 27 Nov 2023',
    active: true,
  },
  {
    unit_code: 'COS10001',
    name: 'Introduction to Programming',
    unit_role: 'Convenor',
    teaching_period: 'Custom',
    start_date: 'Mon 28 Aug 2023',
    end_date: 'Mon 27 Nov 2023',
    active: true,
  },
];

@Component({
  selector: 'f-units',
  templateUrl: './f-units.component.html',
  styleUrls: ['./f-units.component.scss'],
})
export class FUnitsComponent {
  displayedColumns: string[] = [
    'unit_code',
    'name',
    'unit_role',
    'teaching_period',
    'start_date',
    'end_date',
    'active',
  ];
  dataSource = ELEMENT_DATA;
  constructor() {}
}
