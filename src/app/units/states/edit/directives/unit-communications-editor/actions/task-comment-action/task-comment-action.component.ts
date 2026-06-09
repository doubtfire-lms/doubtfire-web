import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import {Component, Input} from '@angular/core';
import type {UnitCommunicationsEditorComponent} from '../../unit-communications-editor.component';

@Component({
  selector: 'f-task-comment-action',
  standalone: false,
  templateUrl: './task-comment-action.component.html',
  host: {class: 'block w-full'},
})
export class TaskCommentActionComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
  @Input({required: true}) mode: 'add' | 'edit';
}
