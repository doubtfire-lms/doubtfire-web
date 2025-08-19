import {Component, Input} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';
@Component({
  selector: 'f-task-prerequisites-card',
  templateUrl: './task-prerequisites-card.component.html',
  styleUrls: ['./task-prerequisites-card.component.scss'],
})
export class TaskPrerequisitesCardComponent {
  @Input() taskDefinition: TaskDefinition;
}
