import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import type {UnitCommunicationsEditorComponent} from '../../unit-communications-editor.component';

@Component({
  selector: 'f-change-target-grade-action',
  templateUrl: './change-target-grade-action.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {class: 'flex w-full flex-col items-center'},
  imports: [MatFormField, MatLabel, MatSelect, FormsModule, MatOption],
})
export class ChangeTargetGradeActionComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
  @Input({required: true}) mode: 'add' | 'edit';
}
