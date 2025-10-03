import {Component, Input, OnInit} from '@angular/core';
import {StateService} from '@uirouter/angular';
import {ProjectService} from 'src/app/api/services/project.service';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {Tutorial} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss'],
})
export class TutorialsComponent implements OnInit {
  @Input() projectId: number;

  filteredTutorials: Tutorial[] = [];
  loading: boolean = true; // Used to handle the async fetching of data.
  pageTitle: string = '';
  project: Project;
  reverse: boolean = false;
  roleWhiteList: string[] = [];
  sortOrder: string = ''; // Default sort order.
  task: string = '';
  unit: Unit;

  constructor(
    private stateService: StateService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.projectService.fetch(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.unit = project.unit;
        this.filteredTutorials = this.tutorialCampusFilter(
          [...project.unit.tutorials],
          this.project,
        );

        // Set the sort order based on the unit's tutorialStreamsCache size
        if (this.unit?.tutorialStreamsCache?.size > 0) {
          this.sortOrder = 'tutorialStream.name';
        } else {
          this.sortOrder = 'abbreviation';
        }

        // Access the `data` property of the current state (UI-Router)
        const currentState = this.stateService.current;
        this.pageTitle = currentState.data.pageTitle;
        this.task = currentState.data.task;
        this.roleWhiteList = currentState.data.roleWhiteList;

        // Mark loading as complete - we can now render the template
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching project:', error);
        this.loading = false; // Ensure loading is stopped even on error
      },
    });
  }

  /**
   * Used to determine how to sort the table view.
   *
   * @param order
   *
   * @returns void
   */
  setSortOrder(order: string): void {
    if (this.sortOrder === order) {
      this.reverse = !this.reverse;
    } else {
      this.sortOrder = order;
      this.reverse = false;
    }
    this.updateFilteredTutorials();
  }

  /**
   * Used to perform the actual sorting of the data in the table view.
   *
   * @returns void
   */
  updateFilteredTutorials(): void {
    this.filteredTutorials = [...this.filteredTutorials].sort((a, b) => {
      const valueA = this.getValueByPath(a, this.sortOrder);
      const valueB = this.getValueByPath(b, this.sortOrder);

      if (valueA < valueB) return this.reverse ? 1 : -1;
      if (valueA > valueB) return this.reverse ? -1 : 1;
      return 0;
    });
  }

  /**
   * Traverses the passed-in object to find the key at the supplied path.
   *
   * @param obj Object to traverse
   * @param path The path of the object to find
   *
   * @returns any
   */
  getValueByPath(obj: object, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
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
   * Determines whether the user is enrolled in the passed-in tutorial.
   *
   * @param tutorial
   *
   * @returns boolean
   */
  isEnrolledIn(tutorial: Tutorial): boolean {
    return this.project.isEnrolledIn(tutorial);
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
      return !project.campus?.id || !tutorial.campus || tutorial.campus.id === project.campus.id;
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
}
