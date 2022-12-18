import { UIRouter } from '@uirouter/core';
import { MatPaginator } from '@angular/material/paginator';
import { AfterViewInit, Component, Inject, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { alertService, rolloverTeachingPeriodModal } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';
import { TeachingPeriod, TeachingPeriodBreakService, Unit } from 'src/app/api/models/doubtfire-model';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'teaching-period-units',
  templateUrl: 'teaching-period-units.component.html',
  styleUrls: ['teaching-period-units.component.scss'],
})
export class TeachingPeriodUnitsComponent implements AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() teachingPeriod: TeachingPeriod;
  // Set up the table
  columns: string[] = ['code', 'name', 'teaching_period', 'active'];
  units: Unit[] = new Array<Unit>();

  dataSource = new MatTableDataSource(this.units);

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource([...this.teachingPeriod.units]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Calls the parent's constructor, passing in an object
    // that maps all of the form controls that this form consists of.
  }
  constructor(
    private teachingPeriodBreakService: TeachingPeriodBreakService,
    @Inject(alertService) private alerts: any,
    @Inject(UIRouter) private router: UIRouter,
    @Inject(rolloverTeachingPeriodModal) private rollOverModal: any
  ) {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  rollOver() {
    
    this.rollOverModal.show(this.teachingPeriod);
  }
  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
  }
}
