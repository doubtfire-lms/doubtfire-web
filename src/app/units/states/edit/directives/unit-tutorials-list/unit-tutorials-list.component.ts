import { Component, Input, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { alertService, confirmationModal } from 'src/app/ajs-upgraded-providers';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import {
  Tutorial,
  TutorialService,
  Campus,
  CampusService,
  User,
  TutorialStream,
  TutorialStreamService,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import { EntityFormComponent } from 'src/app/common/entity-form/entity-form.component';
import { UntypedFormControl, Validators } from '@angular/forms';
import { RequestOptions } from 'ngx-entity-service';

@Component({
  selector: 'df-unit-tutorials-list',
  templateUrl: 'unit-tutorials-list.component.html',
  styleUrls: ['unit-tutorials-list.component.scss'],
})
export class UnitTutorialsListComponent extends EntityFormComponent<Tutorial> implements AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() stream: TutorialStream;
  @Input() unit: Unit;

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
    @Inject(confirmationModal) private confirmationModal: any,
    @Inject(alertService) private alerts: any
  ) {
    super(
      {
        meetingDay: new UntypedFormControl('', [Validators.required]),
        meetingTime: new UntypedFormControl(null, [Validators.required]),
        meetingLocation: new UntypedFormControl('', [Validators.required]),
        abbreviation: new UntypedFormControl('', [Validators.required]),
        campus: new UntypedFormControl(null, []),
        capacity: new UntypedFormControl('', [Validators.required]),
        tutor: new UntypedFormControl(null, [Validators.required]),
      },
      'Tutorial'
    );
  }

  ngAfterViewInit(): void {
    if (this.stream) {
      this.origStreamAbbr = this.stream.abbreviation;
      this.origName = this.stream.name;
    }

    this.campusService.query().subscribe((campuses) => {
      this.campuses.push(...campuses);
    });

    this.dataSource = new MatTableDataSource();
    this.filterTutorials();

    this.unit.tutorialsCache.values.subscribe((_t) => this.filterTutorials());
  }

  private filterTutorials(): void {
    this.tutorials = this.unit.tutorials.filter(
      (tutorial) => tutorial.tutorialStream === this.stream || (!tutorial.tutorialStream && !this.stream)
    );
    this.dataSource.data = this.tutorials;
  }

  public saveStream(): void {
    this.tutorialStreamService
      .update({ abbreviation: this.origStreamAbbr, unit_id: this.unit.id }, { entity: this.stream })
      .subscribe({
        next: (stream: TutorialStream) => {
          this.stream = stream;
          this.origStreamAbbr = stream.abbreviation;
          this.origName = stream.name;
          this.editingStream = false;
          this.alerts.add('success', 'Stream updated successfully', 2000);
        },
        error: (error: any) => {
          this.alerts.add('danger', 'Something went wrong - ' + JSON.stringify(error.error), 6000);
        },
      });
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
  onSuccess(response: Tutorial, isNew: boolean): void {
    if (isNew) {
      this.pushToTable(response);
    }
  }

  // Push the values that will be displayed in the table
  // to the datasource
  private pushToTable(value: Tutorial | Tutorial[]) {
    if (!value) return;
    value instanceof Array ? this.tutorials.push(...value) : this.tutorials.push(value);
    this.renderTable();
  }

  // Handle the removal of a tutorial
  public deleteTutorial(tutorial: Tutorial): void {
    this.tutorialService.delete(tutorial, this.optionsOnRequest('delete')).subscribe((_result) => {
      this.cancelEdit();
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
  submit(): void {
    super.submit(this.tutorialService, this.alerts, this.onSuccess.bind(this));
  }

  protected formDataToNewObject(endPointKey: string, _associations?: object): object {
    this.selected = new Tutorial(this.unit);
    this.copyChangesFromForm();
    this.selected.tutorialStream = this.stream;
    super.formDataToNewObject(endPointKey);
    return this.selected;
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
  deleteStream(): void {
    const stream: TutorialStream = this.stream;

    this.confirmationModal.show(
      `Delete Tutorial Stream ${stream.abbreviation}`,
      'Are you sure you want to delete this tutorial stream? This action is final and will delete all associated tutorials.',
      () =>
        this.unit.deleteStream(stream).subscribe({
          next: (response: boolean) => {
            if (response) {
              this.alerts.add('success', `Deleted stream. ${stream.abbreviation}`, 8000);
            } else {
              this.alerts.add('danger', `Failed to delete stream.`, 8000);
            }
          },
          error: (message) => {
            this.alerts.add('danger', `Failed to delete stream. ${message}`, 8000);
          },
        })
    );
  }

  /**
   * Ensure that the unit is passed to the Tutorial entity when create it called.
   */
  protected override optionsOnRequest(kind: 'create' | 'update' | 'delete'): RequestOptions<Tutorial> {
    return {
      constructorParams: this.unit,
      cache: this.unit.tutorialsCache,
    };
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort): void {
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
          return this.sortCompare(a.tutor.name, b.tutor.name, isAsc);
        default:
          return 0;
      }
    });
  }
}
