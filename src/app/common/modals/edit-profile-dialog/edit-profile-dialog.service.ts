import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { User } from 'src/app/api/models/doubtfire-model';
import { EditProfileFormComponent } from '../../edit-profile-form/edit-profile-form.component';

@Injectable({
  providedIn: 'root',
})
export class EditProfileDialogService {
  constructor(public dialog: MatDialog) {}

  openDialog(user: User): void {
    this.dialog.open(EditProfileFormComponent, {
      data: { user, mode: 'edit' },
    });
  }
}
