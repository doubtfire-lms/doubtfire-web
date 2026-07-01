import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {UnitRole} from 'src/app/api/models/unit-role';
import {TutorNotesModalComponent} from './tutor-notes-modal.component';

export interface TutorNotesModalData {
  task?: Task;
  unitRole?: UnitRole;
}

@Injectable({
  providedIn: 'root',
})
export class TutorNotesModalService {
  constructor(public dialog: MatDialog) {}

  public show(task?: Task, unitRole?: UnitRole) {
    const _dialogRef = this.dialog.open<TutorNotesModalComponent, TutorNotesModalData>(
      TutorNotesModalComponent,
      {
        data: {
          task,
          unitRole,
        },
        width: '100%',
        height: '90vh',
        maxWidth: '1200px',
        panelClass: 'overflow-y-auto',
      },
    );
  }
}
