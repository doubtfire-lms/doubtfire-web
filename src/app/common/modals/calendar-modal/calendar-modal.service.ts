import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CalendarModalComponent} from './calendar-modal.component';

@Injectable({
  providedIn: 'root',
})
export class CalendarModalService {
  constructor(public dialog: MatDialog) {}

  public show(_task: any) {
    this.dialog.open(CalendarModalComponent);
  }
}
