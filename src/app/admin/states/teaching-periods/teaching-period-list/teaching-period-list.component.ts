import { UIRouter } from '@uirouter/core';
import { FormControl, Validators } from '@angular/forms';
import { EntityFormComponent } from './../../../../common/entity-form/entity-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { TeachingPeriod, TeachingPeriodService } from 'src/app/api/models/doubtfire-model';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'teaching-period-list',
  templateUrl: 'teaching-period-list.component.html',
  styleUrls: ['teaching-period-list.component.scss'],
})
export class TeachingPeriodListComponent extends EntityFormComponent<TeachingPeriod> implements AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Set up the table
  columns: string[] = ['period', 'year', 'startDate', 'endDate', 'activeUntil', 'options'];
  teachingPeriods: TeachingPeriod[] = new Array<TeachingPeriod>();

  dataSource = new MatTableDataSource(this.teachingPeriods);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private teachingPeriodService: TeachingPeriodService,
    @Inject(alertService) private alerts: any,
    @Inject(UIRouter) private router: UIRouter
  ) {
    super({
      period: new FormControl('', [Validators.required]),
      start_date: new FormControl('', [Validators.required]),
      end_date: new FormControl('', [Validators.required]),
      year: new FormControl('', [Validators.required]),
      active_until: new FormControl('', [Validators.required]),
    },'TeachingPeriod');
  }

  ngOnInit() {
    // Get all teaching periods nd add them to the table
    this.teachingPeriodService.query().subscribe((teachingPeriods) => {
      this.pushToTable(teachingPeriods);
    });
  }
    applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: TeachingPeriod | TeachingPeriod[]) {
    value instanceof Array ? this.teachingPeriods.push(...value) : this.teachingPeriods.push(value);
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }
  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.teachingPeriodService, this.alerts, this.onSuccess.bind(this));
  }

  // This method is passed to the submit method on the parent
  // and is only run when an entity is successfully created or updated
  onSuccess(response: TeachingPeriod, isNew: boolean) {
    if (isNew) {
      this.pushToTable(response);
    }
  }

  // Sorting function to sort data when sort
  // event is triggered
   sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    switch (sort.active) {
      case 'period':
      case 'starDate':
      case 'endDate':
      case 'activeUntil':
        return super.sortTableData(sort);
    }
  }
  goToTeachingPeriodDetails(id) {
   
    this.router.stateService.go(`admin/teaching-periods/${id}}`);
  }
}
