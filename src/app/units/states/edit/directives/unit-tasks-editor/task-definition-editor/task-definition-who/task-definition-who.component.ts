import {SlicePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-definition-who',
  templateUrl: 'task-definition-who.component.html',
  styleUrls: ['task-definition-who.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    MatSlideToggle,
    FormsModule,
    SlicePipe,
  ],
})
export class TaskDefinitionWhoComponent {
  @Input() taskDefinition: TaskDefinition;

  showAllTutorials: boolean = false;
  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  onTutorialStreamChange() {
    this.showAllTutorials = false;
  }
}
