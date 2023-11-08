import { Component, Input, OnInit } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { TasksViewerService } from '../tasks-viewer.service';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-tasks-viewer',
  templateUrl: './tasks-viewer.component.html',
  styleUrls: ['./tasks-viewer.component.scss'],
})
export class TasksViewerComponent implements OnInit {
  @Input() taskDefs: TaskDefinition[];
  @Input() unit: Unit;
  selectedTaskDef: TaskDefinition;
  taskSelected: boolean;

  constructor(private taskViewerService: TasksViewerService) {}

  ngOnInit() {
    this.taskViewerService.selectedTaskDef.subscribe((taskDef) => {
      this.selectedTaskDef = taskDef;
    });

    this.taskViewerService.taskSelected.subscribe((taskSelected) => {
      this.taskSelected = taskSelected;
    });
  }
}
