import { Component, Input, OnInit } from '@angular/core';
import { Unit } from 'src/app/api/models/unit';
import { Grade } from 'src/app/api/models/grade';
import { Task, TaskDefinition } from 'src/app/api/models/doubtfire-model';
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

  filteredTasks: TaskDefinition[] = null; // list of tasks which match the taskSearch term
  taskSearch: string = "";  // task search term from user input
  taskDefinitionNamePipe = new TaskDefinitionNamePipe();
  private gradeNames: string[] = Grade.GRADES;

  constructor() {}

  applyFilters() {
    this.filteredTasks = this.taskDefinitionNamePipe.transform(this.unitTasks, this.taskSearch);
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  setSelectedTask(task: TaskDefinition) {
    this.selectedTaskDef = task;
  }

  isSelectedTask(task: TaskDefinition) {
    return this.selectedTaskDef.id == task.id;
  }
}
