import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommunicationSet} from 'src/app/api/models/doubtfire-model';
import type {UnitCommunicationsEditorComponent} from '../unit-communications-editor.component';

@Component({
  selector: 'f-communication-schedules',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './communication-schedules.component.html',
})
export class CommunicationSchedulesComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) set: CommunicationSet;
}
