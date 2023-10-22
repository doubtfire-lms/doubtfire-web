import { Component, Input, Inject, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { UIRouter } from '@uirouter/core';
import { createUnitModal } from 'src/app/ajs-upgraded-providers';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { UnitService } from 'src/app/api/services/unit.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

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
  dataload: boolean;

  constructor(
    @Inject(createUnitModal) private createUnitModal: any,
    private globalStateService: GlobalStateService,
    private unitService: UnitService,
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

  ngOnInit() {
    this.globalStateService.setView(ViewType.OTHER);
    // console.log(this.globalStateService.loadedUnits.currentValues);
    // // Listen for units to be loaded
    // this.globalStateService.onLoad(() => {
    //   const loadedUnitRoles = this.globalStateService.loadedUnitRoles.currentValues;
    //   this.unitRoles = [...loadedUnitRoles];

    //   this.globalStateService.loadedUnits.values.subscribe((units) => (this.allUnits = units));
    //   this.loadAllUnits();
    //   //console.log(this.dataSource);
    // });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'unit_code':
        case 'name':
        case 'unit_role':
        case 'teaching_period':
        case 'start_date':
        case 'end_date':
        case 'active':
          return this.sortCompare(a[sort.active], b[sort.active], isAsc);
        default:
          return 0;
      }
    });
  }
}
