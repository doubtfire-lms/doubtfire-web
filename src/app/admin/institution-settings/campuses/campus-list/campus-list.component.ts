import {AfterViewInit, ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {Campus, CampusService} from 'src/app/api/models/doubtfire-model';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'campus-list',
  templateUrl: 'campus-list.component.html',
  styleUrls: ['campus-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CampusListComponent extends EntityFormComponent<Campus> implements AfterViewInit {
  @ViewChild(MatTable, {static: true}) table: MatTable<Campus>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  syncModes = ['timetable', 'automatic', 'manual'];

  // Set up the table
  columns: string[] = ['name', 'abbreviation', 'mode', 'timezone', 'active', 'options'];
  campuses: Campus[] = new Array<Campus>();
  dataSource = new MatTableDataSource(this.campuses);

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(
    private campusService: CampusService,
    private alerts: AlertService,
  ) {
    super(
      {
        abbreviation: new UntypedFormControl('', [Validators.required]),
        name: new UntypedFormControl('', [Validators.required]),
        mode: new UntypedFormControl('', [Validators.required]),
        timezone: new UntypedFormControl('', [Validators.required]),
        active: new UntypedFormControl(false),
      },
      'Campus',
    );
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
    if (!value) {
      return;
    }

    if (value instanceof Array) {
      this.campuses.push(...value);
    } else {
      this.campuses.push(value);
    }
    this.dataSource.sort = this.sort;
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.campusService, this.alerts, this.onSuccess.bind(this));
  }

  // This method is called when the delete button is clicked
  deleteCampus(campus: Campus) {
    this.delete(campus, this.campuses, this.campusService).subscribe({
      next: () => {
        this.alerts.success(`${campus.name} has been deleted.`, 2000);
      },
      error: (response) => {
        this.alerts.error(response.error?.error || 'Unable to delete campus.');
      },
    });
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
      case 'timezone':
      case 'active':
        return super.sortTableData(sort);
    }
  }
}
