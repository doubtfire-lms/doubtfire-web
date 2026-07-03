import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'bulk-import-staff-modal',
  templateUrl: './bulk-import-staff-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatDialogActions,
    MatButton,
  ],
})
export class BulkImportStaffModalComponent {
  public emailList = '';

  constructor(public dialogRef: MatDialogRef<BulkImportStaffModalComponent, string | undefined>) {}

  public cancel(): void {
    this.dialogRef.close(undefined);
  }

  public submit(): void {
    const trimmedEmails = this.emailList.trim();
    if (!trimmedEmails) {
      return;
    }

    this.dialogRef.close(trimmedEmails);
  }
}
