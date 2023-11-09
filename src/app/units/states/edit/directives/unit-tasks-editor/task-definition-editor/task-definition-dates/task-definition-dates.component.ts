import { Component, Input } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-dates',
  templateUrl: 'task-definition-dates.component.html',
  styleUrls: ['task-definition-dates.component.scss'],
})
export class TaskDefinitionDatesComponent {
  @Input() taskDefinition: TaskDefinition;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
