import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {UnitRole} from 'src/app/api/models/unit-role';
import {TutorNotesModalData} from './tutor-notes-modal.service';

@Component({
  selector: 'f-tutor-notes-modal',
  templateUrl: './tutor-notes-modal.component.html',
  styleUrl: './tutor-notes-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
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
