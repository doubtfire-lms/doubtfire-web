import { Component, Input, OnInit } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';

@Component({
  selector: 'f-tasks-viewer',
  templateUrl: './tasks-viewer.component.html',
  styleUrls: ['./tasks-viewer.component.scss']
})
export class TasksViewerComponent implements OnInit {

  @Input() taskDefs: TaskDefinition[];
  selectedTaskDef: TaskDefinition;

  ngOnInit() {
    console.log(this.taskDefs);
    this.selectedTaskDef = this.taskDefs[0];

  }
}
