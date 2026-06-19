import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription, of} from 'rxjs';
import {Project, Tutorial, Unit} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TutorialsComponent implements OnInit, OnDestroy {
  @Input() public project$: Observable<Project>;

  filteredTutorials: Tutorial[] = [];

  project: Project;
  unit: Unit;

  displayedColumns: string[] = [
    'stream',
    'campus',
    'code',
    'day',
    'time',
    'room',
    'tutor',
    'actions',
  ];

  dataSource: MatTableDataSource<Tutorial> = new MatTableDataSource([]);

  private projectSub?: Subscription;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.project$ = this.project$ ?? of(this.route.parent?.snapshot.data.project as Project);

    this.projectSub = this.project$?.subscribe((project) => {
      if (!project || !project.unit) {
        return;
      }

      this.project = project;
      this.unit = project.unit;
      this.filteredTutorials = this.tutorialCampusFilter([...(this.unit.tutorials ?? [])], project);
      this.dataSource.data = this.filteredTutorials;
    });
  }

  ngOnDestroy(): void {
    this.projectSub?.unsubscribe();
  }

  /**
   * Switches to the passed-in tutorial.
   *
   * @param tutorial
   *
   * @returns void
   */
  switchToTutorial(tutorial: Tutorial): void {
    this.project.switchToTutorial(tutorial);
  }

  /**
   * Filters a collection of passed-in tutorials based on the campus_id of the passed-in project.
   *
   * @param tutorials
   * @param project
   *
   * @returns Tutorial[]
   */
  tutorialCampusFilter(tutorials: Tutorial[], project: Project): Tutorial[] {
    if (!project) {
      return tutorials;
    }
    return tutorials.filter((tutorial) => {
      return (
        !project.campus?.id ||
        !tutorial.campus ||
        tutorial.campus.id === project.campus.id ||
        project.isEnrolledIn(tutorial)
      );
    });
  }

  /**
   * Formats the passed-in time string to the format of: HH:mm
   * Todo: Add date validation
   * @param meetingTime
   *
   * @returns string
   */
  shortTime(meetingTime: string): string {
    const [hours, minutes] = meetingTime.split(':');
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  private sortCompare(
    aValue: number | string | undefined,
    bValue: number | string | undefined,
    isAsc: boolean,
  ) {
    const left = aValue ?? '';
    const right = bValue ?? '';

    if (left === right) {
      return 0;
    }

    return (left < right ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      switch (sort.active) {
        case 'stream':
          return this.sortCompare(
            a.tutorialStream?.name,
            b.tutorialStream?.name,
            sort.direction === 'asc',
          );
        case 'campus':
          return this.sortCompare(a.campus?.name, b.campus?.name, sort.direction === 'asc');
        case 'code':
          return this.sortCompare(a.abbreviation, b.abbreviation, sort.direction === 'asc');
        case 'day': {
          return this.sortCompare(a.meetingDay, b.meetingDay, sort.direction === 'asc');
        }
        case 'time': {
          return this.sortCompare(
            this.shortTime(a.meetingTime),
            this.shortTime(b.meetingTime),
            sort.direction === 'asc',
          );
        }
        case 'room': {
          return this.sortCompare(a.meetingLocation, b.meetingLocation, sort.direction === 'asc');
        }
        case 'tutor':
          return this.sortCompare(a.tutorName, b.tutorName, sort.direction === 'asc');
        default:
          return 0;
      }
    });
  }
}
