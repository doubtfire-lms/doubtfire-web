import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'bulk-import-staff-modal',
  templateUrl: './bulk-import-staff-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
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
