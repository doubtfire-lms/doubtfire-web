import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TutorialStream, Unit} from 'src/app/api/models/doubtfire-model';
import {UnitTutorialModalComponent} from './unit-tutorial-modal.component';

@Injectable({
  providedIn: 'root',
})
export class UnitTutorialModalService {
  constructor(public dialog: MatDialog) {}

  public show(unit: Unit, stream?: TutorialStream): MatDialogRef<UnitTutorialModalComponent> {
    return this.dialog.open(UnitTutorialModalComponent, {
      data: {unit, stream},
    });
  }
}
