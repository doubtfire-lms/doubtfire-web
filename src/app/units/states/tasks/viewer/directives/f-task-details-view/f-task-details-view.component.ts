import { Component, Input, Inject } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-details-view',
  templateUrl: 'f-task-details-view.component.html',
  styleUrls: ['f-task-details-view.component.scss'],
})
export class FTaskDetailsViewComponent {
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  constructor() {
    console.log("Task Details View Component says HELLO WORLD!")
  }
}
