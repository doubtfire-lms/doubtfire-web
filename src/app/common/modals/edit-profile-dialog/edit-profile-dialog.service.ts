import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/api/models/doubtfire-model';
import { EditProfileFormComponent } from '../../edit-profile-form/edit-profile-form.component';

@Injectable({
  providedIn: 'root',
})
export class EditProfileDialogService {
  constructor(public dialog: MatDialog) {}

  openDialog(user: User): void {
    this.dialog.open(EditProfileFormComponent, {
      width: '800px',
      data: { user, mode: 'edit' },
    });
  }
}
