import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WebcalService } from 'src/app/api/models/webcal/webcal.service';
import { Webcal } from 'src/app/api/models/webcal/webcal';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({ 
  selector: 'calendar-modal',
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.scss']
})
export class CalendarModalComponent implements OnInit {

  constructor(
    private webcalService: WebcalService,
    private constants: DoubtfireConstants,
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
  }

  public webcal: Webcal;

  ngOnInit() {
    // Retrieve current webcal.
    this.webcalService.get({}).subscribe(
      (webcal) => this.webcal = webcal
    );
  }
  
  get webcalUrl(): string {
    return this.webcal.getUrl(this.constants.API_URL);
  }
}
