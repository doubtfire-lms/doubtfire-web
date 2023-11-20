import { Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-options',
  templateUrl: 'task-definition-options.component.html',
  styleUrls: ['task-definition-options.component.scss'],
})
export class TaskDefinitionOptionsComponent {
  @Input() taskDefinition: TaskDefinition;

  public scoreControl = new FormControl('', [Validators.max(100), Validators.min(0)]);

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
