import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'calendar-modal',
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.scss']
})
export class CalendarModalComponent {

  constructor(
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 

  }
}