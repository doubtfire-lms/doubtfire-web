import { Component, Input, OnInit, signal } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TasksViewerService } from '../../../tasks-viewer.service';

@Component({
  selector: 'f-task-details-view',
  templateUrl: './f-task-details-view.component.html',
  styleUrls: ['./f-task-details-view.component.scss'],
})
export class FTaskDetailsViewComponent implements OnInit {
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  constructor(private tasksViewerService: TasksViewerService) {}

  ngOnInit() {
    this.tasksViewerService.selectedTaskDef.subscribe((taskDef) => {
      this.taskDef = taskDef;
    });
  }

  public readonly panelOpenState = signal(false);
}
