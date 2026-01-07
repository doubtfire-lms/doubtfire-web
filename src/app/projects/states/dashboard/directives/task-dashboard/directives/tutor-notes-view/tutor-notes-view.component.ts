import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-tutor-notes-view',
  templateUrl: './tutor-notes-view.component.html',
  styleUrls: ['./tutor-notes-view.component.scss'],
})
export class TutorNotesViewComponent {
  @Input() task?;
  // @Input() project;
  public get unitRole() {
    const enrolments = this.task.project.tutorialEnrolmentsCache.currentValues.filter(
      (t) => t.tutorialStream.name === this.task.definition.tutorialStream.name,
    );
    // TODO: is checking for just the one tutorial enrolment correct? should be..
    if (enrolments.length === 1) {
      const user = enrolments[0].tutor;
      return this.task.unit.staff.find((ur) => ur.user.id === user.id);
    }
  }
}
