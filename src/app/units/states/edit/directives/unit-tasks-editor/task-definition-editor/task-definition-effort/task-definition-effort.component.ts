import { Component, Input } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TaskDefinitionService } from 'src/app/api/services/task-definition.service';

@Component({
  selector: 'f-task-definition-effort',
  templateUrl: 'task-definition-effort.component.html',
  styleUrls: ['task-definition-effort.component.scss'],
})
export class TaskDefinitionEffortComponent {
  @Input() taskDefinition: TaskDefinition;
  @Input() staffView: boolean;
  constructor(private TaskDefinitionService: TaskDefinitionService) {}
  enablePrediction = true;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  runPrediction() {
    if (!this.taskDefinition || !this.taskDefinition.id) return;

    this.TaskDefinitionService.predictEffort(this.taskDefinition).subscribe({
      next: () => {
        console.log('Prediction queued');
      },
      error: (err) => {
        console.error('Prediction failed', err);
      },
    });
  }
}
