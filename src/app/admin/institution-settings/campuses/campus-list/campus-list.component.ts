import { Component, Inject, ViewChild } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Campus, CampusService } from 'src/app/api/models/doubtfire-model';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';

@Component({
  selector: 'campus-list',
  templateUrl: 'campus-list.component.html',
  styleUrls: ['campus-list.component.scss'],
})
export class CampusListComponent extends EntityFormComponent<Campus> {
  @ViewChild(MatTable, { static: true }) table: MatTable<Campus>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  syncModes = ['timetable', 'automatic', 'manual'];

  // Set up the table
  columns: string[] = ['name', 'abbreviation', 'mode', 'active', 'options'];
  campuses: Campus[] = new Array<Campus>();
  dataSource = new MatTableDataSource(this.campuses);

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(private campusService: CampusService, @Inject(alertService) private alerts: any) {
    super({
      abbreviation: new UntypedFormControl('', [Validators.required]),
      name: new UntypedFormControl('', [Validators.required]),
      mode: new UntypedFormControl('', [Validators.required]),
      active: new UntypedFormControl(false),
    }, "Campus");
  }

  ngAfterViewInit() {
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
    if (!value) return;

    value instanceof Array ? this.campuses.push(...value) : this.campuses.push(value);
    this.dataSource.sort = this.sort;
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.campusService, this.alerts, this.onSuccess.bind(this));
  }

  // This method is called when the delete button is clicked
  deleteCampus(campus: Campus) {
    this.delete(campus, this.campuses, this.campusService).subscribe(
      {
        next: () => {
          this.alerts.add('success', `${campus.name} has been deleted.`, 2000);
        },
        error: (response) => {this.alerts.add( 'danger', response.error?.error || "Unable to delete campus.");}
      }
    );
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
      case 'active':
        return super.sortTableData(sort);
    }
  }
}
