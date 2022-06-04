import { Component, Input, Inject, ViewChild, OnInit } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import {
  Tutorial,
  TutorialService,
  Campus,
  CampusService,
  User,
  TutorialStream,
  TutorialStreamService,
} from 'src/app/api/models/doubtfire-model';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'df-unit-tutorials-list',
  templateUrl: 'unit-tutorials-list.component.html',
  styleUrls: ['unit-tutorials-list.component.scss'],
})
export class UnitTutorialsListComponent extends EntityFormComponent<Tutorial> implements OnInit{
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() stream: TutorialStream;
  @Input() unit: any;

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Asynchronous'];

  campuses: Campus[] = new Array<Campus>();
  columns: string[] = ['abbreviation', 'campus', 'location', 'day', 'time', 'tutor', 'capacity', 'options'];
  tutorials: Tutorial[];

  private editingStream: boolean = false;

  /**
   * The original stream abbreviation is required to update the stream - as it may change but is used in the url.
   */
  private origStreamAbbr: string;
  private origName: string;

  constructor(
    private tutorialService: TutorialService,
    private tutorialStreamService: TutorialStreamService,
    private campusService: CampusService,
    @Inject(alertService) private alerts: any
  ) {
    super({
      meeting_day: new UntypedFormControl('', [Validators.required]),
      meeting_time: new UntypedFormControl(null, [Validators.required]),
      meeting_location: new UntypedFormControl('', [Validators.required]),
      abbreviation: new UntypedFormControl('', [Validators.required]),
      campus: new UntypedFormControl(null, []),
      capacity: new UntypedFormControl('', [Validators.required]),
      tutor: new UntypedFormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    if (this.stream) {
      this.origStreamAbbr = this.stream.abbreviation;
      this.origName = this.stream.name;
    }
    this.campusService.query().subscribe((campuses) => {
      this.campuses.push(...campuses);
    });
    this.filterTutorials();
    this.dataSource = new MatTableDataSource(this.tutorials);
  }

  private filterTutorials(): void {
    this.tutorials = this.unit.tutorials.filter(
      (tutorial) => tutorial.tutorial_stream === this.stream || (!tutorial.tutorial_stream && !this.stream)
    );
  }

  public saveStream() {
    this.tutorialStreamService.update( {abbreviation: this.origStreamAbbr, unit_id: this.unit.id}, this.stream).subscribe(
      {
        next: (stream: TutorialStream) => {
          this.stream = stream;
          this.origStreamAbbr = stream.abbreviation;
          this.origName = stream.name;
          this.editingStream = false;
          this.alerts.add('success', 'Stream updated successfully', 2000);
        },
        error: (error: any) => {
          this.alerts.add('danger', 'Something went wrong - ' + JSON.stringify(error.error), 6000);
        }
      }
    )
  }

  public setEditStream(value: boolean): void {
    if (!value) {
      this.stream.abbreviation = this.origStreamAbbr;
      this.stream.name = this.origName;
    }
    this.editingStream = value;
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
  public deleteTutorial(tutorial: Tutorial) {
    this.tutorialService.delete(tutorial).subscribe((result) => {
      this.cancelEdit();
      this.unit.tutorials.splice(this.tutorials.indexOf(tutorial), 1);
      this.filterTutorials();
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

  /**
   * Ensure that the unit is passed to the Tutorial entity when create it called.
   */
  protected otherOnCreate(): any {
    return this.unit;
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
