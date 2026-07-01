import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import type {UnitCommunicationsEditorComponent} from '../../unit-communications-editor.component';

@Component({
  selector: 'f-change-target-grade-action',
  standalone: false,
  templateUrl: './change-target-grade-action.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {class: 'flex w-full flex-col items-center'},
})
export class ChangeTargetGradeActionComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
  @Input({required: true}) mode: 'add' | 'edit';
}
