import {Component, Input, OnInit} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Tutorial, UnitService} from 'src/app/api/models/doubtfire-model';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';

@Component({
  selector: 'f-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss'],
})
export class TutorialsComponent implements OnInit {
  @Input() projectId: number;

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

  dataSource = new MatTableDataSource<Tutorial>([]);

  constructor(
    private projectService: ProjectService,
    private unitService: UnitService,
  ) {}

  ngOnInit(): void {
    this.projectService.fetch(this.projectId).subscribe({
      next: (project) => {
        this.unitService.get(project.unit.id).subscribe({
          next: (unit) => {
            this.unit = unit;
            this.project = project;
            this.filteredTutorials = this.tutorialCampusFilter([...unit.tutorials], this.project);
            this.dataSource.data = this.filteredTutorials;
          },
          error: (error) => {
            console.error('Error fetching unit:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error fetching project:', error);
      },
    });
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

  private sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
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
