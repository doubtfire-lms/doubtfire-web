import { Component, Input } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TaskDefinitionService } from 'src/app/api/services/task-definition.service';
import { AlertService } from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-task-definition-editor',
  templateUrl: 'task-definition-editor.component.html',
  styleUrls: ['task-definition-editor.component.scss'],
})
export class TaskDefinitionEditorComponent {
  @Input() taskDefinition: TaskDefinition;
  @Input() unit: Unit;
  @Input() isNew: boolean;

  constructor(private taskDefinitionService: TaskDefinitionService, private alerts: AlertService) {}

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
          next: (response) => this.alerts.success('Task Added', 2000),
          error: (message) => this.alerts.error(message, 6000),
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
          next: (response) => this.alerts.success('Task Updated', 2000),
          error: (message) => this.alerts.error(message, 6000),
        });
    }
  }
}
