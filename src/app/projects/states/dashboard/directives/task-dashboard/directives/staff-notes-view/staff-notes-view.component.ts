import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-staff-notes-view',
  templateUrl: './staff-notes-view.component.html',
  styleUrls: ['./staff-notes-view.component.scss'],
})
export class StaffNotesViewComponent {
  @Input() project;
}
