import { Component, Inject, Input } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TaskDefinitionService } from 'src/app/api/services/task-definition.service';

@Component({
  selector: 'f-task-definition-editor',
  templateUrl: 'task-definition-editor.component.html',
  styleUrls: ['task-definition-editor.component.scss'],
})
export class TaskDefinitionEditorComponent {
  @Input() taskDefinition: TaskDefinition;
  @Input() unit: Unit;
  @Input() isNew: boolean;

  constructor(private taskDefinitionService: TaskDefinitionService, @Inject(alertService) private alerts: any) {}

  public step = 0;

  public setStep(index: number) {
    this.step = index;
  }

  public nextStep() {
    this.step++;
  }

  public prevStep() {
    this.step--;
  }

  public save() {
    if (this.isNew) {
      // TODO: add progress modal
      this.taskDefinitionService
        .create(
          {
            unitId: this.unit.id,
          },
          {
            entity: this.taskDefinition,
            cache: this.unit.taskDefinitionCache,
            constructorParams: this.unit,
          }
        )
        .subscribe({
          next: (response) => this.alerts.add('success', 'Task Added', 2000),
          error: (message) => this.alerts.add('danger', message, 6000),
        });
    } else {
      this.taskDefinitionService
        .update(
          {
            unitId: this.unit.id,
            id: this.taskDefinition.id,
          },
          { entity: this.taskDefinition }
        )
        .subscribe({
          next: (response) => this.alerts.add('success', 'Task Updated', 2000),
          error: (message) => this.alerts.add('danger', message, 6000),
        });
    }
  }
}
