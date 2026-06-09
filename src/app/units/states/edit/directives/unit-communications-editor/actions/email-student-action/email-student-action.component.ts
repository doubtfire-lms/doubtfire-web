import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import {Component, Input} from '@angular/core';
import type {UnitCommunicationsEditorComponent} from '../../unit-communications-editor.component';

@Component({
  selector: 'f-email-student-action',
  standalone: false,
  templateUrl: './email-student-action.component.html',
  host: {class: 'block w-full'},
})
export class EmailStudentActionComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
  @Input({required: true}) mode: 'add' | 'edit';
}
