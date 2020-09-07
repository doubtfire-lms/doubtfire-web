import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WebcalService } from 'src/app/api/models/webcal/webcal.service';
import { Webcal } from 'src/app/api/models/webcal/webcal';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'calendar-modal',
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.scss']
})
export class CalendarModalComponent implements OnInit, AfterViewInit {

  constructor(
    private webcalService: WebcalService,
    private constants: DoubtfireConstants,
    private sanitizer: DomSanitizer,
    @Inject(alertService) private alerts: any,
    dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  @ViewChild('webcalToggle') webcalToggle: MatSlideToggle;

  webcal: Webcal | null;
  working: boolean = false;

  ngOnInit() {
    // Retrieve current webcal.
    this.working = true;
    this.webcalService.get({}).subscribe(
      (webcal) => {
        this.webcal = webcal;
        this.working = false;
      }
    );
  }

  ngAfterViewInit() {
    // Disallow the value of the slide toggle being changed by the user. Instead, its value is bound to the presence of
    // `this.webcal`.
    this.webcalToggle.defaults.disableToggleValue = true;
  }

  /**
   * Retrieves the URL of the webcal relative to current API URL.
   */
  get webcalUrl(): string {
    return this.webcal ? this.webcal.getUrl(this.constants.API_URL).toString() : null;
  }

  /**
   * Invoked when the user clicks the
   */
  onWebcalToggle() {
    this.working = true;
    this.webcalService.updateWebcal({
      enabled: !this.webcalToggle.checked,
    }).subscribe((webcal) => {
      this.webcal = webcal;
      this.working = false;
    });
  }

  /**
   * Displays a notification that the webcal URL has been copied.
   * `cdkCopyToClipboard` is expected do the actual copying.
   */
  onCopyWebcalUrl() {
    this.alerts.add('success', 'Web calendar URL copied to the clipboard');
  }

  /**
   * Invoked when the user requests their webcal URL to be changed.
   */
  onChangeWebcalUrl() {
    this.working = true;
    this.webcalService.updateWebcal({
      should_change_id: true,
    }).subscribe((webcal) => {
      this.webcal = webcal;
      this.working = false;
    })
  }

  /**
   * Includes task 'Start Dates' in the Webcal.
   */
  toggleIncludeTaskStartDates() {
    this.working = true;
    this.webcalService.updateWebcal({
      include_start_dates: !this.webcal.include_start_dates,
    }).subscribe((webcal) => {
      this.webcal = webcal;
      this.working = false;
    });;
  }

  /**
   * Bypasses sanitization of the specified URL.
   */
  bypass(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
