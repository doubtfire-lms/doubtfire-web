import { Component, Input, OnInit } from '@angular/core';
import { Grade } from 'src/app/api/models/grade';
import { TaskDefinition } from 'src/app/api/models/doubtfire-model';
import { TaskDefinitionNamePipe } from 'src/app/common/filters/task-definition-name.pipe';
import { TasksViewerService } from '../../../tasks-viewer.service';

@Component({
  selector: 'f-unit-task-list',
  templateUrl: './f-unit-task-list.component.html',
  styleUrls: ['./f-unit-task-list.component.scss'],
})
export class FUnitTaskListComponent implements OnInit {
  @Input() unitTasks: TaskDefinition[];
  filteredTasks: TaskDefinition[]; // list of tasks which match the taskSearch term
  taskSearch: string = ''; // task search term from user input
  taskDefinitionNamePipe = new TaskDefinitionNamePipe();
  protected gradeNames: string[] = Grade.GRADES;
  selectedTaskDef: TaskDefinition;
  taskSelected: boolean;

  constructor(private taskViewerService: TasksViewerService) {}

  applyFilters() {
    this.filteredTasks = this.taskDefinitionNamePipe.transform(this.unitTasks, this.taskSearch);
  }

  ngOnInit(): void {
    this.applyFilters();

    this.taskViewerService.selectedTaskDef.subscribe((taskDef) => {
      this.selectedTaskDef = taskDef;
    });
    this.taskViewerService.selectedTaskDef.next(this.unitTasks[0]);

    this.taskViewerService.taskSelected.subscribe((taskSelected) => {
      this.taskSelected = taskSelected;
    });
  }

  setSelectedTask(task: TaskDefinition) {
    this.taskViewerService.setSelectedTaskDef(task);
  }

  isSelectedTask(task: TaskDefinition) {
    return this.selectedTaskDef.id == task.id;
  }
}
