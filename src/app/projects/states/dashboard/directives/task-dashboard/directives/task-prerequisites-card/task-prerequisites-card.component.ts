import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatCard, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {Task} from 'src/app/api/models/task';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TaskDefinitionPrerequisitesComponent} from '../../../../../../../units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-prerequisites/task-definition-prerequisites.component';

@Component({
  selector: 'f-task-prerequisites-card',
  templateUrl: './task-prerequisites-card.component.html',
  styleUrls: ['./task-prerequisites-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatCard, MatCardTitle, MatIcon, MatCardSubtitle, TaskDefinitionPrerequisitesComponent],
})
export class TaskPrerequisitesCardComponent {
  @Input() taskDefinition: TaskDefinition;
  @Input() task?: Task;
}
