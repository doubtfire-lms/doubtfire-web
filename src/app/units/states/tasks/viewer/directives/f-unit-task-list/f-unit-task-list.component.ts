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
  @Input() selectedTaskDef: TaskDefinition;

  @Input() taskData: {
    source: (unit: Unit, taskDef: TaskDefinition | number) => Observable<Task[]>;
    selectedTask: Task,
    onSelectedTaskChange: (task: Task) => void;
  }


  // task filtering
  //----------------------------------------------------------------------------------------------------

  filteredTasks: TaskDefinition[] = null; // list of tasks which match the taskSearch term
  taskSearch: string = "";  // task search term from user input
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
    // console.log(this.unit);

    // Apply filters first-time
    this.applyFilters();
  }

  setSelectedTask(task: TaskDefinition) {
    // console.log(task);
    this.selectedTaskDef = task;
  }

  isSelectedTask(task: TaskDefinition) {
    return this.selectedTaskDef.id == task.id;
  }
}
