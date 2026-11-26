import {HttpErrorResponse} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {
  Tutorial,
  TutorialStream,
  TutorialStreamService,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {UnitTutorialModalService} from 'src/app/units/modals/unit-tutorial-modal/unit-tutorial-modal.service';

@Component({
  selector: 'df-unit-tutorials-list',
  templateUrl: 'unit-tutorials-list.component.html',
  styleUrls: ['unit-tutorials-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitTutorialsListComponent
  extends EntityFormComponent<Tutorial>
  implements OnInit, OnDestroy
{
  @Input() stream: TutorialStream;
  @Input() unit: Unit;

  columns: string[] = [
    'abbreviation',
    'campus',
    'location',
    'day',
    'time',
    'duration',
    'tutor',
    'capacity',
    'options',
  ];
  tutorials: Tutorial[] = [];
  dataSource: MatTableDataSource<Tutorial> = new MatTableDataSource();

  public editingStream: boolean = false;
  private subscriptions: Subscription[] = [];

  /**
   * The original stream abbreviation is required to update the stream - as it may change but is used in the url.
   */
  private origStreamAbbr: string;
  private origName: string;

  constructor(
    private tutorialStreamService: TutorialStreamService,
    private confirmationModal: ConfirmationModalService,
    private tutorialModal: UnitTutorialModalService,
    private alerts: AlertService,
  ) {
    // Sorting helpers only - editing happens in the tutorial modal.
    super({}, 'Tutorial');
  }

  ngOnInit(): void {
    if (this.stream) {
      this.origStreamAbbr = this.stream.abbreviation;
      this.origName = this.stream.name;
    }

    this.filterTutorials();

    this.subscriptions.push(
      this.unit.tutorialsCache.values.subscribe((_t) => this.filterTutorials()),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private filterTutorials(): void {
    this.tutorials = this.unit.tutorials.filter(
      (tutorial) =>
        tutorial.tutorialStream === this.stream || (!tutorial.tutorialStream && !this.stream),
    );
    this.dataSource.data = this.tutorials;
  }

  public saveStream(): void {
    this.tutorialStreamService
      .update({abbreviation: this.origStreamAbbr, unit_id: this.unit.id}, {entity: this.stream})
      .subscribe({
        next: (stream: TutorialStream) => {
          this.stream = stream;
          this.origStreamAbbr = stream.abbreviation;
          this.origName = stream.name;
          this.editingStream = false;
          this.alerts.success('Stream updated successfully', 2000);
        },
        error: (error: HttpErrorResponse) => {
          this.alerts.error('Something went wrong - ' + JSON.stringify(error.error), 6000);
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

  public newTutorial(): void {
    this.tutorialModal.show(this.unit, this.stream);
  }

  public editTutorial(tutorial: Tutorial): void {
    this.tutorialModal
      .show(this.unit, this.stream, tutorial)
      .afterClosed()
      .subscribe(() => this.filterTutorials());
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
              this.alerts.success(`Deleted stream. ${stream.abbreviation}`, 8000);
            } else {
              this.alerts.error(`Failed to delete stream.`, 8000);
            }
          },
          error: (message) => {
            this.alerts.error(`Failed to delete stream. ${message}`, 8000);
          },
        }),
    );
  }

  formatDurationShort(minutes: number): string {
    if (minutes == null) {
      return '';
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes}m`;
    }
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }

  formatDuration(minutes: number): string {
    if (minutes == null) {
      return '';
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
    }
    if (remainingMinutes === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data = [...this.dataSource.data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'abbreviation':
          return this.sortCompare(a.abbreviation, b.abbreviation, isAsc);
        case 'campus':
          return this.sortCompare(a.campus?.abbreviation, b.campus?.abbreviation, isAsc);
        case 'location':
          return this.sortCompare(a.meetingLocation, b.meetingLocation, isAsc);
        case 'day':
          return this.sortCompare(a.meetingDay, b.meetingDay, isAsc);
        case 'time':
          return this.sortCompare(a.meetingTime, b.meetingTime, isAsc);
        case 'duration':
          return this.sortCompare(a.durationMinutes, b.durationMinutes, isAsc);
        case 'tutor':
          return this.sortCompare(a.tutorName, b.tutorName, isAsc);
        case 'capacity':
          return this.sortCompare(a.capacity, b.capacity, isAsc);
        default:
          return 0;
      }
    });
  }
}
