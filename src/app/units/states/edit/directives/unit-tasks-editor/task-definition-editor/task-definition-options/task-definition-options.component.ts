import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'f-task-definition-options',
  templateUrl: 'task-definition-options.component.html',
  styleUrls: ['task-definition-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatCheckbox, FormsModule, MatFormField, MatLabel, MatInput],
})
export class TaskDefinitionOptionsComponent {
  @Input() taskDefinition: TaskDefinition;
  constructor(private confirmationModal: ConfirmationModalService) {}

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public onToggleAssessInPortfolioOnly() {
    if (!this.taskDefinition.assessInPortfolioOnly) {
      return;
    }

    setTimeout(() => {
      this.taskDefinition.assessInPortfolioOnly = false;
      console.log(this.taskDefinition.assessInPortfolioOnly);

      this.confirmationModal.show(
        `Enable Assess in Portfolio Only?`,
        `Enabling Assess in Portfolio Only will update all overdue tasks for ${this.taskDefinition.name} to the Assess in Portfolio state`,
        () => {
          this.taskDefinition.assessInPortfolioOnly = true;
        },
      );
    });
  }
}
