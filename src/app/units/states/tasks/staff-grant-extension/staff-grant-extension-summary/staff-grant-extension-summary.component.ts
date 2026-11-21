// staff-grant-extension-summary.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ExtensionSummaryPayload } from 'src/app/units/states/tasks/staff-grant-extension/models/extension-results.model';


@Component({
  selector: 'f-staff-grant-extension-summary',
  templateUrl: './staff-grant-extension-summary.component.html',
  styleUrls: ['./staff-grant-extension-summary.component.scss']
})
export class StaffGrantExtensionSummaryComponent implements OnInit, OnDestroy {
  @Input() summary!: ExtensionSummaryPayload | null;
  @Output() dismissed = new EventEmitter<void>();

  expiryDate?: Date;
  expiryFormatted = '';
  successCount = 0;
  failedCount = 0;
  skippedCount = 0;

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;


  ngOnInit(): void {
    if (!this.summary) return;

    const createdAt = this.summary.createdAt ? new Date(this.summary.createdAt) : new Date();
    this.expiryDate = new Date(createdAt.getTime() + (this.summary.weeksRequested * 7 * 24 * 60 * 60 * 1000));
    this.expiryFormatted = this.expiryDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    this.successCount = (this.summary.results?.successful ?? []).length;
    this.failedCount = (this.summary.results?.failed ?? []).length;
    this.skippedCount = (this.summary.results?.skipped ?? []).length;

    this.scheduleAutoDismiss();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  dismiss(): void {
    this.clearTimers();
    this.dismissed.emit();
  }

  // Timer: setTimeout supports max ~2,147,483,647ms (~24.85 days)
  private scheduleAutoDismiss(): void {
    if (!this.expiryDate) return;
    const msUntilExpiry = this.expiryDate.getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      // already expired
      this.dismiss();
      return;
    }

    const MAX_TIMEOUT = 2147483647; // max setTimeout reliably
    if (msUntilExpiry <= MAX_TIMEOUT) {
      this.timeoutId = setTimeout(() => this.dismiss(), msUntilExpiry);
    } else {
      // for long durations, poll daily until expiry
      this.intervalId = setInterval(() => {
        if (Date.now() >= (this.expiryDate!.getTime())) {
          this.clearTimers();
          this.dismiss();
        }
      }, 24 * 60 * 60 * 1000);
    }
  }

  private clearTimers(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
