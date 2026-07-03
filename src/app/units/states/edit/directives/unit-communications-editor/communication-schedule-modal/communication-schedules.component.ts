import {ExtendedModule} from 'ng-flex-layout/extended';
import {NgClass} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {CommunicationSet} from 'src/app/api/models/doubtfire-model';
import type {UnitCommunicationsEditorComponent} from '../unit-communications-editor.component';

@Component({
  selector: 'f-communication-schedules',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './communication-schedules.component.html',
  imports: [MatProgressBar, ExtendedModule, NgClass, MatIconButton, MatIcon],
})
export class CommunicationSchedulesComponent {
  @Input({required: true}) editor: UnitCommunicationsEditorComponent;
  @Input({required: true}) set: CommunicationSet;
}
