import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Unit } from 'src/app/api/models/unit';
import { Grade } from 'src/app/api/models/grade';
import { Task, TaskDefinition } from 'src/app/api/models/doubtfire-model';
import { TaskDefinitionNamePipe } from 'src/app/common/filters/task-definition-name.pipe';
import { SelectedTaskService } from 'src/app/projects/states/dashboard/selected-task.service';import { TasksViewerService } from '../../../tasks-viewer.service';
;

@Component({
  selector: 'f-unit-task-list',
  templateUrl: './f-unit-task-list.component.html',
  styleUrls: ['./f-unit-task-list.component.scss'],
})
export class FUnitTaskListComponent implements OnInit {
  @Input() unitTasks: TaskDefinition[];
  filteredTasks: any[] = null; // list of tasks which match the taskSearch term
  taskSearch: string = "";  // task search term from user input
  taskDefinitionNamePipe = new TaskDefinitionNamePipe();
  private gradeNames: string[] = Grade.GRADES;
  selectedTaskDef: TaskDefinition;

  constructor(
    private taskViewerService: TasksViewerService
  ) {}

  applyFilters() {
    this.filteredTasks = this.taskDefinitionNamePipe.transform(this.unitTasks, this.taskSearch);
  }

  ngOnInit(): void {
    this.applyFilters();

    this.taskViewerService.selectedTaskDef.subscribe((taskDef) => {
      this.selectedTaskDef = taskDef;
    });
    this.taskViewerService.selectedTaskDef.next(this.unitTasks[0]);
  }

  setSelectedTask(task: TaskDefinition) {
    // this shouldn't exist anymore
    console.log("Selected Task: ", this.selectedTaskDef.name);
    console.log("url: ", task.getTaskPDFUrl())
    this.taskViewerService.setSelectedTaskDef(task);
  }

  isSelectedTask(task: TaskDefinition) {
    return this.selectedTaskDef.id == task.id;
  }
}
