import {User} from 'src/app/api/models/doubtfire-model';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {EditProfileFormComponent} from '../../edit-profile-form/edit-profile-form.component';

@Injectable({
  providedIn: 'root',
})
export class EditProfileDialogService {
  constructor(public dialog: MatDialog) {}

  openDialog(user: User, mode: 'edit' | 'create' | 'new'): void {
    this.dialog.open(EditProfileFormComponent, {
      width: '100%',
      maxWidth: '800px',
      data: {user, mode: mode, modal: true},
      panelClass: 'overflow-y-auto',
    });
  }
}
