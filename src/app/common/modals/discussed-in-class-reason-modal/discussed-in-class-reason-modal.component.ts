import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface DiscussedInClassReasonModalData {
  title: string;
  prompt: string;
  prefix: string;
}

@Component({
  selector: 'f-discussed-in-class-reason-modal',
  templateUrl: './discussed-in-class-reason-modal.component.html',
  styleUrl: './discussed-in-class-reason-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DiscussedInClassReasonModalComponent {
  public readonly minimumReasonLength = 25;
  public reasonBody = '';

  constructor(
    public dialogRef: MatDialogRef<DiscussedInClassReasonModalComponent, string | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: DiscussedInClassReasonModalData,
  ) {}

  public get trimmedReasonBody(): string {
    return this.reasonBody.trim();
  }

  public get hasReasonBody(): boolean {
    return this.trimmedReasonBody.length >= this.minimumReasonLength;
  }

  public get notePreview(): string {
    return `${this.data.prefix} ${this.trimmedReasonBody}`.trim();
  }

  public cancel(): void {
    this.dialogRef.close(undefined);
  }

  public submit(): void {
    if (!this.hasReasonBody) {
      return;
    }

    this.dialogRef.close(this.notePreview);
  }
}
