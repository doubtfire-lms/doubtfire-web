import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CreateUnitModalComponent } from './create-unit-modal.component';

@Injectable({
  providedIn: 'root',
})
export class CreateUnitModalService {
  constructor(public dialog: MatDialog) {}

  public show(units: any) {
    let dialogRef: MatDialogRef<CreateUnitModalComponent, any>;
    dialogRef = this.dialog.open(CreateUnitModalComponent, {
      data: {
        units,
      },
    });
  }
}
