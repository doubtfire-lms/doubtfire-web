import {Project} from 'src/app/api/models/doubtfire-model';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SpecConModalComponent} from './spec-con-modal.component';

@Injectable({
  providedIn: 'root',
})
export class SpecConModalService {
  constructor(public dialog: MatDialog) {}

  public show(project: Project) {
    const dialogRef: MatDialogRef<SpecConModalComponent, {project: Project}> = this.dialog.open(
      SpecConModalComponent,
      {
        data: {project: project},
      },
    );
  }
}
