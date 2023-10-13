import { Component, Input, Inject, OnInit } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TasksViewerService } from '../../../tasks-viewer.service';

@Component({
  selector: 'f-task-details-view',
  templateUrl: './f-task-details-view.component.html',
  styleUrls: ['./f-task-details-view.component.scss'],
})
export class FTaskDetailsViewComponent implements OnInit {
  taskDef: TaskDefinition;
  @Input() unit: Unit;

  constructor(private tasksViewerService: TasksViewerService) {
    console.log("Task Details View Component says HELLO WORLD!")
  }

  ngOnInit() {
    console.log("Task Details View Component says HELLO WORLD!")
    this.tasksViewerService.selectedTaskDef.subscribe((taskDef) => {
      console.log(taskDef);
      this.taskDef = taskDef;
    });
  }
}
