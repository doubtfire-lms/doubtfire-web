import { Component, Inject, ViewChild } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { ActivityType, ActivityTypeService } from 'src/app/api/models/doubtfire-model';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'activity-type-list',
  templateUrl: 'activity-type-list.component.html',
  styleUrls: ['activity-type-list.component.scss'],
})
export class ActivityTypeListComponent extends EntityFormComponent<ActivityType> {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Set up the table
  columns: string[] = ['name', 'abbreviation', 'options'];
  activityTypes: ActivityType[] = new Array<ActivityType>();
  dataSource = new MatTableDataSource(this.activityTypes);

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor(private activityTypeService: ActivityTypeService, @Inject(alertService) private alerts: any) {
    super({
      name: new UntypedFormControl('', [Validators.required]),
      abbreviation: new UntypedFormControl('', [Validators.required]),
    }, "Activity Type");
  }

  ngAfterViewInit() {
    // Get all the activity types and add them to the table
    this.activityTypeService.query().subscribe((activityTypes) => {
      this.pushToTable(activityTypes);
    });
  }

  // This method is passed to the submit method on the parent
  // and is only run when an entity is successfully created or updated
  onSuccess(response: ActivityType, isNew: boolean) {
    if (isNew) {
      this.pushToTable(response);
    }
  }

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: ActivityType | ActivityType[]) {
    if (!value) return;
    value instanceof Array ? this.activityTypes.push(...value) : this.activityTypes.push(value);
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.activityTypeService, this.alerts, this.onSuccess.bind(this));
  }

  deleteActivity(activity: ActivityType) {
    this.delete(activity, this.activityTypes, this.activityTypeService).subscribe(
      {
        next: () => {
          this.alerts.add('success', `${activity.name} has been deleted.`, 2000);
        },
        error: (response) => {this.alerts.add( 'danger', response.error?.error || "Unable to delete activity type.");}
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
        return super.sortTableData(sort);
    }
  }
}
