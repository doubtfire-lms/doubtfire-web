import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-submission-date',
  // styleUrl: './task-definition-submission-date.component.scss',
  templateUrl: './task-definition-submission-date.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionSubmissionDateComponent {
  @Input() taskDefinition: TaskDefinition;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
