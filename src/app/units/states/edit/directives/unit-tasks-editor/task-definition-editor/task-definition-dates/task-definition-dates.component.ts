import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-dates',
  templateUrl: 'task-definition-dates.component.html',
  styleUrls: ['task-definition-dates.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    FormsModule,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatHint,
  ],
})
export class TaskDefinitionDatesComponent {
  @Input() taskDefinition: TaskDefinition;

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }
}
