import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ProgressModalComponent } from './progress-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ProgressModalService {
  constructor(public dialog: MatDialog) {}

  public show() {
    let dialogRef: MatDialogRef<ProgressModalComponent, any>;
    dialogRef = this.dialog.open(ProgressModalComponent, {});
  }
}
