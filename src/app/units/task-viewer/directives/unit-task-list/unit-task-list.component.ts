import {Component, Input, OnInit} from '@angular/core';
import {Grade} from 'src/app/api/models/grade';
import {TaskDefinition, Task} from 'src/app/api/models/doubtfire-model';
import {TaskDefinitionNamePipe} from 'src/app/common/filters/task-definition-name.pipe';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'f-unit-task-list',
  templateUrl: './unit-task-list.component.html',
  styleUrls: ['./unit-task-list.component.scss'],
})
export class FUnitTaskListComponent implements OnInit {
  @Input() mode: 'project' | 'all-tasks';
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

  applyFilters() {
    this.filteredTaskDefinitions = this.taskDefinitionNamePipe.transform(
      this.taskDefinitions,
      this.searchText,
    );
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
  }

  setSelectedTaskDefinition(taskDef: TaskDefinition) {
    if (this.isSelectedTaskDefinition(taskDef)) {
      this.selectedTaskDefinition$.next(null);
    } else {
      this.selectedTaskDefinition$.next(taskDef);
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
}
