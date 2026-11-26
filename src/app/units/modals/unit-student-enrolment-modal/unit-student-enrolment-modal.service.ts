import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Unit} from 'src/app/api/models/doubtfire-model';
import {UnitStudentEnrolmentModalComponent} from './unit-student-enrolment-modal.component';

@Injectable({
  providedIn: 'root',
})
export class UnitStudentEnrolmentModalService {
  constructor(public dialog: MatDialog) {}

  public show(unit: Unit) {
    this.dialog.open(UnitStudentEnrolmentModalComponent, {
      data: {
        unit: unit,
      },
    });
  }
}
