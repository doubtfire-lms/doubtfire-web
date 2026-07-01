import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {TaskDefinition} from 'src/app/api/models/task-definition';

@Component({
  selector: 'f-task-prerequisites-card',
  templateUrl: './task-prerequisites-card.component.html',
  styleUrls: ['./task-prerequisites-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskPrerequisitesCardComponent {
  @Input() taskDefinition: TaskDefinition;
  @Input() task?: Task;
}
