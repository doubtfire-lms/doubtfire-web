import {Location} from '@angular/common';
import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Grade} from 'src/app/api/models/grade';
import {Project, TaskDefinition, Task} from 'src/app/api/models/doubtfire-model';
import {TaskDefinitionNamePipe} from 'src/app/common/filters/task-definition-name.pipe';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'f-unit-task-list',
    templateUrl: './unit-task-list.component.html',
    styleUrls: ['./unit-task-list.component.scss'],
    standalone: false
})
export class FUnitTaskListComponent implements OnChanges, OnInit {
  @Input() mode: 'project' | 'all-tasks';
  @Input() project: Project;
  @Input() taskDefinitions: TaskDefinition[];
  @Input() tasks: Task[];

  // What is the selected task definition
  @Input() selectedTaskDefinition$: BehaviorSubject<TaskDefinition>;
  selectedTaskDef: TaskDefinition;

  // @Output() selectedTask: EventEmitter<Task> = new EventEmitter<Task>();

  filteredTaskDefinitions: TaskDefinition[]; // list of tasks which match the taskSearch term
  searchText: string = ''; // task search term from user input
  taskDefinitionNamePipe = new TaskDefinitionNamePipe();
  protected gradeNames: string[] = Grade.GRADES;

  constructor(
    private location: Location,
    private angularRouter: Router,
    private route: ActivatedRoute,
  ) {}

  applyFilters() {
    this.filteredTaskDefinitions = this.taskDefinitionNamePipe.transform(
      this.taskDefinitions,
      this.searchText,
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('taskDefinitions' in changes || 'tasks' in changes) {
      this.applyFilters();

      if (
        this.selectedTaskDef &&
        !this.filteredTaskDefinitions?.some((taskDef) => taskDef.id === this.selectedTaskDef.id)
      ) {
        this.selectedTaskDefinition$.next(null);
      }
    }
  }

  public get hasTasks(): boolean {
    return this.tasks && this.tasks.length > 0;
  }

  public taskForTaskDef(taskDef: TaskDefinition): Task {
    if (!this.hasTasks || !taskDef) {
      return null;
    }

    return this.tasks.find((task) => task.definition.id === taskDef?.id);
  }

  public taskListItem(taskDef: TaskDefinition): Task {
    return this.taskForTaskDef(taskDef);
  }

  /*
    TODO: There's still an issue where loading the route for the first time will cause child components (like task-dashboard) to load trigger OnInit and OnChanges twice...
    Causing duplicate queries to submission_details and task comments.
    One hack would be to always keep the task-dashboard rendered using [hidden].
  */

  ngOnInit(): void {
    this.applyFilters();

    // Watch for changes in the selected task definition... including from us
    this.selectedTaskDefinition$.subscribe((taskDef) => {
      this.selectedTaskDef = taskDef;
    });

    // // TODO: Remove the service
    // this.taskViewerService.selectedTaskDef.subscribe((taskDef) => {
    //   this.selectedTaskDef = taskDef;
    // });

    // this.taskViewerService.taskSelected.subscribe((taskSelected) => {
    //   this.taskSelected = taskSelected;
    // });

    // // Select the first task definition by default
    // if (this.taskDefinitions.length > 0) {
    //   this.setSelectedTaskDefinition(this.taskDefinitions[0]);
    // }

    // Load selected task from URL
    const current = this.selectedTaskDefinition$.value;
    const param = this.route.snapshot.paramMap.get('taskAbbreviation');

    queueMicrotask(() => {
      if (param) {
        const taskDef = this.taskDefinitions.find((t) => t.abbreviation === param);

        if (taskDef !== current) {
          this.selectedTaskDefinition$.next(taskDef);
        }
      } else if (current !== null) {
        this.selectedTaskDefinition$.next(null);
      }
    });
  }

  setSelectedTaskDefinition(taskDef: TaskDefinition) {
    if (this.isSelectedTaskDefinition(taskDef)) {
      this.selectedTaskDefinition$.next(null);
      this.replaceSelectionUrl(null);
    } else {
      this.selectedTaskDefinition$.next(taskDef);
      this.replaceSelectionUrl(taskDef);
    }

    // this.selectedTaskDefinition.emit(taskDef);
    // const selectedTask = this.taskForTaskDef(taskDef);
    // if (selectedTask) {
    //   this.selectedTask$.next(selectedTask);
    // }

    //TODO: remove
    // this.taskViewerService.setSelectedTaskDef(taskDef);
  }

  public isSelectedTaskDefinition(taskDef: TaskDefinition): boolean {
    return this.selectedTaskDef?.id === taskDef?.id;
  }

  private replaceSelectionUrl(taskDef: TaskDefinition | null): void {
    const urlTree = this.buildSelectionUrlTree(taskDef);
    if (!urlTree) {
      return;
    }

    this.location.replaceState(this.angularRouter.serializeUrl(urlTree));
  }

  private buildSelectionUrlTree(taskDef: TaskDefinition | null) {
    const unitId = this.route.parent?.snapshot.paramMap.get('unitId');
    if (this.route.parent?.snapshot.data.unit && unitId) {
      return this.angularRouter.createUrlTree(
        taskDef
          ? ['/units', unitId, 'tasks', taskDef.abbreviation]
          : ['/units', unitId, 'tasks'],
      );
    }

    const projectId = this.route.parent?.snapshot.paramMap.get('projectId');
    if (this.route.parent?.snapshot.data.project && projectId) {
      return this.angularRouter.createUrlTree(
        taskDef
          ? ['/projects', projectId, 'dashboard', taskDef.abbreviation]
          : ['/projects', projectId, 'dashboard'],
      );
    }

    return null;
  }
}
