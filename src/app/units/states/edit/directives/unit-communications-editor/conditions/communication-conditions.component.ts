import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import {Component, Input} from '@angular/core';
import type {UnitCommunicationsEditorComponent} from '../unit-communications-editor.component';

@Component({
  selector: 'f-communication-conditions',
  standalone: false,
  templateUrl: './communication-conditions.component.html',
})
export class CommunicationConditionsComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
}
