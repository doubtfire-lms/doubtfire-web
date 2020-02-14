import { Component, Inject, ViewChild } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FormControl, Validators } from '@angular/forms';
import { CampusService } from 'src/app/api/models/campus/campus.service';
import { Campus } from 'src/app/api/models/campus/campus';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';

@Component({
  selector: 'campus-list',
  templateUrl: 'campus-list.component.html',
  styleUrls: ['campus-list.component.scss']
})
export class CampusListComponent extends EntityFormComponent<Campus> {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  syncModes = ['timetable', 'automatic', 'manual'];

  // Set up the table
  columns: string[] = ['name', 'abbreviation', 'mode', 'active', 'options'];
  campuses: Campus[] = new Array<Campus>();
  dataSource = new MatTableDataSource(this.campuses);

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private campusService: CampusService,
    @Inject(alertService) private alerts: any
  ) {
    super({
      abbreviation: new FormControl('', [
        Validators.required
      ]),
      name: new FormControl('', [
        Validators.required
      ]),
      mode: new FormControl('', [
        Validators.required
      ]),
      active: new FormControl(false)
    });
  }

  ngOnInit() {
    // Get all the campuses and add them to the table
    this.campusService.query().subscribe((campuses) => {
      this.pushToTable(campuses);
    });
  }

  // This method is passed to the submit method on the parent
  // and is only run when an entity is successfully created or updated
  onSuccess(response: Campus, isNew: boolean) {
    if (isNew) {
      this.pushToTable(response);
    }
  }

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: Campus | Campus[]) {
    value instanceof Array ? this.campuses.push(...value) : this.campuses.push(value);
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.campusService, this.alerts, this.onSuccess.bind(this));
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    switch (sort.active) {
      case 'name':
      case 'abbreviation':
      case 'mode':
      case 'active': return super.sortTableData(sort);
    }
  }
}
