import { Component, Input, OnInit } from '@angular/core';
import { Unit } from 'src/app/api/models/unit';
import { Grade } from 'src/app/api/models/grade';
import { Task, TaskDefinition } from 'src/app/api/models/doubtfire-model';
import { Observable } from 'rxjs';
import { SelectedTaskService } from 'src/app/projects/states/dashboard/selected-task.service';
import { TaskDefinitionNamePipe } from 'src/app/common/filters/task-definition-name.pipe';


@Component({
  selector: 'f-unit-task-list',
  templateUrl: './f-unit-task-list.component.html',
  styleUrls: ['./f-unit-task-list.component.scss'],
})
export class FUnitTaskListComponent implements OnInit {
  @Input() unit: Unit;
  @Input() unitTasks: TaskDefinition[];
  @Input() task: Task;
  // @Input() selectedTaskDef: Task;

  @Input() taskData: {
    source: (unit: Unit, taskDef: TaskDefinition | number) => Observable<Task[]>;
    selectedTask: Task,
    onSelectedTaskChange: (task: Task) => void;
  }


  // task filtering
  //----------------------------------------------------------------------------------------------------

  filteredTasks: TaskDefinition[] = null;
  taskSearch: string = "";
  taskDefinitionNamePipe = new TaskDefinitionNamePipe();

  applyFilters() {
    this.filteredTasks = this.taskDefinitionNamePipe.transform(this.unitTasks, this.taskSearch);
  }

  //----------------------------------------------------------------------------------------------------

  private gradeNames: string[] = Grade.GRADES;

  constructor(
    private selectedTaskService: SelectedTaskService
  ) {}

  ngOnInit(): void {
    console.log(this.unit);
    // console.log(this.selectedTaskDef);

    // Apply filters first-time
    this.applyFilters();
  }

  // ngOnChanges()

  setSelectedTask(task: Task) {
    console.log(task);
    this.selectedTaskService.setSelectedTask(task);
    this.taskData.selectedTask = task;
    if (this.taskData.onSelectedTaskChange) {
      this.taskData.onSelectedTaskChange(task);
    }
    // if (task) {
    //   this.scrollToTaskInList(task);
    // }
  }

  isSelectedTask(task: Task) {
    // const sameProject = this.taskData.selectedTask?.project.id == task.project.id;
    // const sameTaskDef = this.taskData.selectedTask?.definition.id == task.definition.id;
    return false;
    // const sameProject = this.taskData.selectedTask?.project.id === task.project.id;
    // const sameTaskDef = this.taskData.selectedTask?.definition.id === task.definition.id;
    // return sameProject && sameTaskDef;
  }
}