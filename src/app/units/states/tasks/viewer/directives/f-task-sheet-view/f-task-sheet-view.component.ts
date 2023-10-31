import { Component, Input, OnInit } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { TasksViewerService } from '../../../tasks-viewer.service';

@Component({
  selector: 'f-task-sheet-view',
  templateUrl: './f-task-sheet-view.component.html',
  styleUrls: ['./f-task-sheet-view.component.scss'],
})
export class FTaskSheetViewComponent implements OnInit {
  @Input() taskDef: TaskDefinition;

  constructor(private taskViewerService: TasksViewerService) {}

  ngOnInit(): void {
    this.taskViewerService.selectedTaskDef.subscribe((taskDef) => {
      this.taskDef = taskDef;
    });
  }
}
