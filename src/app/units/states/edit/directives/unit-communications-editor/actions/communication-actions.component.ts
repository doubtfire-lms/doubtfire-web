import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import type {UnitCommunicationsEditorComponent} from '../unit-communications-editor.component';

@Component({
  selector: 'f-communication-actions',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './communication-actions.component.html',
})
export class CommunicationActionsComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
}
