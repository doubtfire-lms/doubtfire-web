import {Component, Input} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Task} from 'src/app/api/models/task';
@Component({
    selector: 'f-task-prerequisites-card',
    templateUrl: './task-prerequisites-card.component.html',
    styleUrls: ['./task-prerequisites-card.component.scss'],
    standalone: false
})
export class TaskPrerequisitesCardComponent {
  @Input() taskDefinition: TaskDefinition;
  @Input() task?: Task;
}
