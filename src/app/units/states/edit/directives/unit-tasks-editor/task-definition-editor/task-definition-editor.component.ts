import { Component, Input } from '@angular/core';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TaskDefinitionService } from 'src/app/api/services/task-definition.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-task-definition-editor',
  templateUrl: 'task-definition-editor.component.html',
  styleUrls: ['task-definition-editor.component.scss'],
})
export class TaskDefinitionEditorComponent {
  @Input() taskDefinition: TaskDefinition;
  @Input() unit: Unit;

  constructor(private taskDefinitionService: TaskDefinitionService, private alerts: AlertService, private constants: DoubtfireConstants) {
    constants.IsOverseerEnabled.subscribe((enabled) => (this.overseerEnabled = enabled && this.unit.overseerEnabled));
  }

  public overseerEnabled: boolean = false;

  public save() {
    this.taskDefinition.save().subscribe({
      next: (response) => {
        this.alerts.success('Task Saved');
        response.setOriginalSaveData(this.taskDefinitionService.mapping);
      },
      error: (message) => this.alerts.error(message),
    });
  }
}
