import { Component, Input } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-who',
  templateUrl: 'task-definition-who.component.html',
  styleUrls: ['task-definition-who.component.scss'],
})
export class TaskDefinitionWhoComponent {
  @Input() taskDefinition: TaskDefinition;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
