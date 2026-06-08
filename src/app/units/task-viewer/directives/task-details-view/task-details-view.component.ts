import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {Component, Input, signal} from '@angular/core';

@Component({
  selector: 'f-task-details-view',
  templateUrl: './task-details-view.component.html',
  styleUrls: ['./task-details-view.component.scss'],
  standalone: false,
})
export class FTaskDetailsViewComponent {
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  public readonly panelOpenState = signal(false);
}
