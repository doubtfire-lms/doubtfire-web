import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

export interface SubmissionRequestDeniedModalData {
  requestedAt: Date;
  supportId: string;
}

@Component({
  selector: 'f-submission-request-denied-modal',
  templateUrl: './submission-request-denied-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionRequestDeniedModalComponent {
  public readonly externalName = this.constants.ExternalName;
  public readonly requestTime: string;
  public readonly timeZone: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SubmissionRequestDeniedModalData,
    private dialogRef: MatDialogRef<SubmissionRequestDeniedModalComponent>,
    private constants: DoubtfireConstants,
  ) {
    this.requestTime = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(data.requestedAt);
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
  }

  public get copyText(): string {
    return [
      'Submission blocked by network security',
      `Request time: ${this.requestTime}`,
      `Browser time zone: ${this.timeZone}`,
      `Support ID: ${this.data.supportId}`,
    ].join('\n');
  }

  public close(): void {
    this.dialogRef.close();
  }
}
