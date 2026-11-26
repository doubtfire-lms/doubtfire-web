import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BulkImportStaffModalComponent} from './bulk-import-staff-modal.component';

@Injectable({
  providedIn: 'root',
})
export class BulkImportStaffModalService {
  constructor(private dialog: MatDialog) {}

  public show(): MatDialogRef<BulkImportStaffModalComponent, string | undefined> {
    return this.dialog.open<BulkImportStaffModalComponent, undefined, string | undefined>(
      BulkImportStaffModalComponent,
      {
        position: {top: '2.5%'},
        width: '100%',
        maxWidth: '700px',
      },
    );
  }
}
