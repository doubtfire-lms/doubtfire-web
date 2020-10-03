import { Component, Input, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { Tutorial } from 'src/app/api/models/tutorial/tutorial';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { TutorialService } from 'src/app/api/models/tutorial/tutorial.service';
import { FormControl, Validators } from '@angular/forms';
import { Campus } from 'src/app/api/models/campus/campus';
import { CampusService } from 'src/app/api/models/campus/campus.service';
import { User } from 'src/app/api/models/user/user';
import { TutorialStream } from 'src/app/api/models/tutorial-stream/tutorial-stream';

@Component({
  selector: 'unit-tutorials-list',
  templateUrl: 'unit-tutorials-list.component.html',
  styleUrls: ['unit-tutorials-list.component.scss'],
})
export class UnitTutorialsListComponent extends EntityFormComponent<Tutorial> {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() stream: TutorialStream;
  @Input() unit: any;

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Asynchronous'];

  campuses: Campus[] = new Array<Campus>();
  columns: string[] = ['abbreviation', 'campus', 'location', 'day', 'time', 'tutor', 'capacity', 'options'];
  tutorials: Tutorial[];

  constructor(
    private tutorialService: TutorialService,
    private campusService: CampusService,
    @Inject(alertService) private alerts: any
  ) {
    super({
      meeting_day: new FormControl('', [Validators.required]),
      meeting_time: new FormControl(null, [Validators.required]),
      meeting_location: new FormControl('', [Validators.required]),
      abbreviation: new FormControl('', [Validators.required]),
      campus: new FormControl(null, []),
      capacity: new FormControl('', [Validators.required]),
      tutor: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.campusService.query().subscribe((campuses) => {
      this.campuses.push(...campuses);
    });
    this.tutorials = this.unit.tutorials.filter((tutorial) => tutorial.tutorial_stream === this.stream);
    this.dataSource = new MatTableDataSource(this.tutorials);
  }

  // This method is passed to the submit method on the parent
  // and is only run when an entity is successfully created or updated
  onSuccess(response: Tutorial, isNew: boolean) {
    if (isNew) {
      this.unit.tutorials.push(response);
      this.pushToTable(response);
    }
  }

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: Tutorial | Tutorial[]) {
    value instanceof Array ? this.tutorials.push(...value) : this.tutorials.push(value);
    this.renderTable();
  }

  // Handle the removal of a tutorial
  private deleteTutorial(tutorial: Tutorial) {
    this.tutorialService.delete(tutorial).subscribe((result) => {
      this.cancelEdit();
      this.tutorials.splice(this.tutorials.indexOf(tutorial), 1);
      this.renderTable();
    });
  }

  private renderTable() {
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }

  // This method is called when the form is submitted,
  // which then calls the parent's submit.
  submit() {
    super.submit(this.tutorialService, this.alerts, this.onSuccess.bind(this));
  }

  protected formDataToNewObject(endPointKey: string, associations?: object): object {
    const result = super.formDataToNewObject(endPointKey);
    if (this.stream) {
      result['tutorial']['tutorial_stream_abbr'] = this.stream.abbreviation;
    }
    return Tutorial.mapToCreateJson(this.unit, result);
  }

  // This comparison function is required to determine what campus or user
  // to render in the associated mat-select components when editing a
  // tutorial. The function is bound to the compareFn attribute on the related
  // mat-selects.
  // See: https://angular.io/api/forms/SelectControlValueAccessor
  compareSelection(aEntity: User | Campus | any, bEntity: User | Campus) {
    if (!aEntity || !bEntity) {
      return;
    }
    if (bEntity instanceof User) {
      return aEntity.user_id === bEntity.id;
    } else {
      return aEntity.id === bEntity.id;
    }
  }

  // Handle the deletion of a stream
  deleteStream() {
    this.unit.deleteStream(this.stream);
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    switch (sort.active) {
      case 'abbreviation':
      case 'location':
      case 'day':
      case 'time':
      case 'capacity':
        return super.sortTableData(sort);
    }
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'campus':
          return this.sortCompare(a.campus ? a.campus.abbreviation : '', b.campus ? b.campus.abbreviation : '', isAsc);
        case 'tutor':
          return this.sortCompare(a.tutorName, b.tutorName, isAsc);
        default:
          return 0;
      }
    });
  }
}
