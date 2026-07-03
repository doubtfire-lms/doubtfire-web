import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {UnitRole} from 'src/app/api/models/unit-role';
import {TutorNotesViewComponent} from '../../../projects/states/dashboard/directives/task-dashboard/directives/tutor-notes-view/tutor-notes-view.component';
import {TutorNotesModalData} from './tutor-notes-modal.service';

@Component({
  selector: 'f-tutor-notes-modal',
  templateUrl: './tutor-notes-modal.component.html',
  styleUrl: './tutor-notes-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TutorNotesViewComponent],
})
export class TutorNotesModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: TutorNotesModalData) {}

  task?: Task;
  unitRole?: UnitRole;

  ngOnInit() {
    this.task = this.data.task;
    this.unitRole = this.data.unitRole;
  }
}
