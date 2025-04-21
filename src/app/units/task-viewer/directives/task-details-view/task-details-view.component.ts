import {Component, Input, signal} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-details-view',
  templateUrl: './task-details-view.component.html',
  styleUrls: ['./task-details-view.component.scss'],
})
export class FTaskDetailsViewComponent {
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  public readonly panelOpenState = signal(false);
}
