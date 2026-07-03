import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatError, MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';

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
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatError,
    MatHint,
    MatDialogActions,
    MatButton,
  ],
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
