import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-task-definition-dates',
  templateUrl: 'task-definition-dates.component.html',
  styleUrls: ['task-definition-dates.component.scss'],
  standalone: false,
})
export class TaskDefinitionDatesComponent {
  @Input() taskDefinition: TaskDefinition;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
