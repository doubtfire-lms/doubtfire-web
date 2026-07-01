import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Task} from 'src/app/api/models/task';
import {CalendarModalComponent} from './calendar-modal.component';

@Injectable({
  providedIn: 'root',
})
export class CalendarModalService {
  constructor(public dialog: MatDialog) {}

  public show(_task?: Task) {
    this.dialog.open(CalendarModalComponent, {
      height: 'h-min',
      maxHeight: '90vh',
      width: '800px',
      maxWidth: '95vw',
    });
  }
}
