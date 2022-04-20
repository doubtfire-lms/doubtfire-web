import { Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UserSettingsModalComponent } from './user-settings-modal.component';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsModalService {
  constructor(public dialog: MatDialog) {}

  public show(data: any) {
    let dialogRef: MatDialogRef<UserSettingsModalComponent, any>;
    dialogRef = this.dialog.open(UserSettingsModalComponent, {
      // height of window
      // height: '600px',
      // open the data on this window(header.component.ts)
      data
    });
  }
}
