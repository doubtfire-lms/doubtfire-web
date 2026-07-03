import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {UnitRole} from 'src/app/api/models/unit-role';
import {TutorNotesComponent} from '../../../../../tutor-notes/tutor-notes.component';

@Component({
  selector: 'f-tutor-notes-view',
  templateUrl: './tutor-notes-view.component.html',
  styleUrls: ['./tutor-notes-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, TutorNotesComponent],
})
export class TutorNotesViewComponent implements OnChanges {
  @Input() task?;
  @Input() unitRole: UnitRole;

  private inferredUnitRole = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.unitRole?.currentValue) {
      this.inferredUnitRole = false;
    }

    if (this.task && (!this.unitRole || this.inferredUnitRole)) {
      this.unitRole = this.task.tutor;
      this.inferredUnitRole = true;
    }
  }
}
