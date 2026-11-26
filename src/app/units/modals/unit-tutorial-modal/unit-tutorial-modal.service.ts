import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Tutorial, TutorialStream, Unit} from 'src/app/api/models/doubtfire-model';
import {UnitTutorialModalComponent} from './unit-tutorial-modal.component';

@Injectable({
  providedIn: 'root',
})
export class UnitTutorialModalService {
  constructor(public dialog: MatDialog) {}

  public show(
    unit: Unit,
    stream?: TutorialStream,
    tutorial?: Tutorial,
  ): MatDialogRef<UnitTutorialModalComponent> {
    return this.dialog.open(UnitTutorialModalComponent, {
      data: {unit, stream, tutorial},
    });
  }
}
