import { Component, Input, Inject, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router'; // Import at the top
import { createUnitModal } from 'src/app/ajs-upgraded-providers';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { UnitService } from 'src/app/api/services/unit.service';

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
export class FUnitsComponent implements AfterViewInit, OnInit {
  @ViewChild(MatTable, { static: false }) table: MatTable<Unit>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[] = [
    'unit_code',
    'name',
    'unit_role',
    'teaching_period',
    'start_date',
    'end_date',
    'active',
  ];
  dataSource: MatTableDataSource<Unit>;
  clickedRows = new Set<Unit>();

  public allUnits: Unit[];
  unitRoles: UnitRole[];
  //dataload: boolean;

  constructor(
    @Inject(createUnitModal) private createUnitModal: any,
    private globalStateService: GlobalStateService,
    private unitService: UnitService,
    private routers: Router, // Inject the Angular router

    private router: UIRouter,
  ) {
    this.dataload = false;
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      console.log('data source exists');
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: any, filter: string) => data.matches(filter);
    }
  }

  navigateToDetails(unit: Unit) {
    // Assuming you want to navigate to a 'details' route with the unit's id as a parameter
    this.routers.navigate(['/units', unit.id, 'admin']);
    console.log(`/#/units/${unit.id}/admin`);
  }

  ngOnInit() {
    this.globalStateService.setView(ViewType.OTHER);

    // Listen for units to be loaded
    this.globalStateService.onLoad(() => {
      const loadedUnitRoles = this.globalStateService.loadedUnitRoles.currentValues;
      this.unitRoles = [...loadedUnitRoles];

      this.globalStateService.loadedUnits.values.subscribe((units) => (this.allUnits = units));
      this.loadAllUnits();
    });
    this.loadAllUnits();
  }

  createUnit() {
    this.createUnitModal.show(this.allUnits);
  }

  private loadAllUnits() {
    // Load all units
    this.unitService.query(undefined, { params: { include_in_active: true } }).subscribe({
      next: (units: Unit[]) => {
        //console.log(units);
        this.dataSource = new MatTableDataSource<Unit>(units);
        this.dataload = true;
      },
      error: (failure) => {
        //TODO: Add alert
        console.log(failure);
      },
    });
  }
}
