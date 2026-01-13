import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {UnitRole} from 'src/app/api/models/unit-role';
import {QrModalData} from 'src/app/common/modals/qr-modal/qr-modal.service';

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
      const enrolments = this.task.project.tutorialEnrolmentsCache.currentValues.filter(
        (t) => t.tutorialStream.name === this.task.definition.tutorialStream.name,
      );
      // TODO: is checking for just the one tutorial enrolment correct? should be..
      if (enrolments.length === 1) {
        const user = enrolments[0].tutor;
        this.unitRole = this.task.unit.staff.find((ur) => ur.user.id === user.id);
      }
    }
  }
}
