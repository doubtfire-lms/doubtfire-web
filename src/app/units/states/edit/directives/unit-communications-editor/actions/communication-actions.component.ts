import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatList, MatListItem} from '@angular/material/list';
import {MatSelect} from '@angular/material/select';
import {CommunicationRule} from 'src/app/api/models/doubtfire-model';
import type {UnitCommunicationsEditorComponent} from '../unit-communications-editor.component';
import {ChangeTargetGradeActionComponent} from './change-target-grade-action/change-target-grade-action.component';
import {EmailStaffActionComponent} from './email-staff-action/email-staff-action.component';
import {EmailStudentActionComponent} from './email-student-action/email-student-action.component';
import {TaskCommentActionComponent} from './task-comment-action/task-comment-action.component';

@Component({
  selector: 'f-communication-actions',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './communication-actions.component.html',
  imports: [
    MatList,
    MatListItem,
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    MatOption,
    EmailStudentActionComponent,
    EmailStaffActionComponent,
    TaskCommentActionComponent,
    ChangeTargetGradeActionComponent,
    MatButton,
    MatIcon,
    MatIconButton,
  ],
})
export class CommunicationActionsComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) rule: CommunicationRule;
}
