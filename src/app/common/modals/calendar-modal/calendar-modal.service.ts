import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CalendarModalComponent} from './calendar-modal.component';

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
