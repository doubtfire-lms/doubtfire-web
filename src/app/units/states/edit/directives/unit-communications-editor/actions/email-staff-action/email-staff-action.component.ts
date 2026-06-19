import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import type {UnitCommunicationsEditorComponent} from '../../unit-communications-editor.component';

@Component({
  selector: 'f-email-staff-action',
  standalone: false,
  templateUrl: './email-staff-action.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {class: 'block w-full'},
})
export class EmailStaffActionComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
  @Input({required: true}) mode: 'add' | 'edit';
}
