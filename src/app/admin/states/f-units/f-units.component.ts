import { Component, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { UnitService } from 'src/app/api/services/unit.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { CreateNewUnitModal } from '../../modals/create-new-unit-modal/create-new-unit-modal.component';

@Component({
  selector: 'f-units',
  templateUrl: './f-units.component.html',
  styleUrls: ['./f-units.component.scss'],
})
export class FUnitsComponent implements AfterViewInit, OnDestroy {
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

  private subscriptions: Subscription[] = [];

  constructor(
    private createUnitDialog: CreateNewUnitModal,
    private unitService: UnitService,
  ) {
    this.dataload = false;
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.unitService.cache.currentValuesClone());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter: string) => data.matches(filter);

    this.subscriptions.push(
      this.unitService.cache.values.subscribe((units) => {
        this.dataSource.data = units;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  createUnit() {
    this.createUnitDialog.show();
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
