import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { UnitIloEditModalComponent } from './unit-ilo-edit-modal.component';

@Injectable({
  providedIn: 'root',
})
export class UnitStudentEnrolmentModalService {
  constructor(public dialog: MatDialog) {}

  public show(ilo: any, unit: any) {
    let dialogRef: MatDialogRef<UnitIloEditModalComponent, any>;
    dialogRef = this.dialog.open(UnitIloEditModalComponent, {
      data: {
        ilo,
        unit,
      },
    });
  }
}
