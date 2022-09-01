import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { UnitIloEditModalComponent } from './unit-ilo-edit-modal.component';

@Injectable({
  providedIn: 'root',
})
export class UnitIloEditModalService {
  constructor(public dialog: MatDialog) {}

  public show(unit: any, ilo: any) {
    let dialogRef: MatDialogRef<UnitIloEditModalComponent, any>;
    dialogRef = this.dialog.open(UnitIloEditModalComponent, {
      data: {
        unit,
        ilo,
      },
    });
  }
}
