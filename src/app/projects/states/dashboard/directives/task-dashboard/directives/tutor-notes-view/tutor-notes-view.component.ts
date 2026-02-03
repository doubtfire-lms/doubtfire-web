import {Component, Input, OnInit} from '@angular/core';
import {UnitRole} from 'src/app/api/models/unit-role';

@Component({
  selector: 'f-tutor-notes-view',
  templateUrl: './tutor-notes-view.component.html',
  styleUrls: ['./tutor-notes-view.component.scss'],
})
export class TutorNotesViewComponent implements OnInit {
  @Input() task?;
  @Input() unitRole: UnitRole;

  ngOnInit(): void {
    if (this.task && !this.unitRole) {
      this.unitRole = this.task.tutor;
    }
  }
}
