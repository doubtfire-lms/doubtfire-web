import { Component, Input, Inject, ViewChild } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { TutorialService } from 'src/app/api/models/tutorial/tutorial.service';
import { FormControl, Validators } from '@angular/forms';
import { Campus } from 'src/app/api/models/campus/campus';
import { CampusService } from 'src/app/api/models/campus/campus.service';
import { User } from 'src/app/api/models/user/user';

@Component({
  selector: 'unit-tutorials-list',
  templateUrl: 'unit-tutorials-list.component.html',
  styleUrls: ['unit-tutorials-list.component.scss']
})
export class UnitTutorialsListComponent extends EntityFormComponent<Tutorial> {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() tutorials: Tutorial[];
  @Input() stream: any;
  @Input() unit: any;

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  campuses: Campus[] = new Array<Campus>();
  columns: string[] = ['abbreviation', 'campus', 'location', 'day', 'time', 'tutor', 'capacity', 'options'];
  dataSource: MatTableDataSource<Tutorial>;

  constructor(
    private tutorialService: TutorialService,
    private campusService: CampusService,
    @Inject(alertService) private alerts: any,
  ) {
    super({
      meeting_day: new FormControl('', [
        Validators.required
      ]),
      meeting_time: new FormControl(null, [
        Validators.required
      ]),
      meeting_location: new FormControl('', [
        Validators.required
      ]),
      abbreviation: new FormControl('', [
        Validators.required
      ]),
      campus: new FormControl(null, [
        Validators.required
      ]),
      capacity: new FormControl('', [
        Validators.required
      ]),
      tutor: new FormControl(null, [
        Validators.required
      ]),
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.tutorials);
    console.log(this.tutorials);
    console.log(this.stream)
  }

  // This method is passed to the submit method on the parent
  // and is only run when an entity is successfully created or updated
  onSuccess(response: Tutorial, isNew: boolean) {
    if (isNew) {
      this.pushToTable(response);
    }
  }

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: Tutorial | Tutorial[]) {
    value instanceof Array ? this.tutorials.push(...value) : this.tutorials.push(value);
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.tutorialService, this.alerts, this.onSuccess.bind(this));
  }

  protected formDataToNewObject(endPointKey: string, associations?: Object): Object {
    let result = super.formDataToNewObject(endPointKey);
    return Tutorial.mapToCreateJson(this.unit, result);
  }

  // This comparison function is required to determine what campus or user
  // to render in the associated mat-select components when editing a
  // tutorial. The function is bound to the compareFn attribute on the related
  // mat-selects.
  // See: https://angular.io/api/forms/SelectControlValueAccessor
  compareSelection(aEntity: User | Campus, bTutor: User | Campus) {
    return aEntity && bTutor ? aEntity.id === bTutor.id : aEntity === bTutor;
  }
}