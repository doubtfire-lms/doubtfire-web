import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {StaffNotesComponent} from '../../../../../staff-notes/staff-notes.component';

@Component({
  selector: 'f-staff-notes-view',
  templateUrl: './staff-notes-view.component.html',
  styleUrls: ['./staff-notes-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, StaffNotesComponent],
})
export class StaffNotesViewComponent {
  @Input() project;
}
