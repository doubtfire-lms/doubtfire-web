import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CalendarModalComponent } from './calendar-modal.component';

@Injectable({
  providedIn: 'root',
})
export class CalendarModalService {
  constructor(public dialog: MatDialog) {}

  public show(task: any) {
    let dialogRef: MatDialogRef<CalendarModalComponent, any>;
    dialogRef = this.dialog.open(CalendarModalComponent);
  }
}
