//
// Modal to show User Profile settings
//
import { Injectable, Component, Inject } from '@angular/core';
import { UserSettingsDialogService } from '../user-settings-modal/user-settings-dialog.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { currentUser } from 'src/app/ajs-upgraded-providers';

interface UserSettingsDialogData {
  user: any,
  currentUser: any,
  externalName: string,
  isNew: boolean,
}

@Component({
  selector: 'user-settings-dialog',
  templateUrl: 'user-settings-dialog.component.html',
})
export class UserSettingsDialogContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserSettingsDialogData) { }
}

@Injectable()
export class UserSettingsDialog {

  userSettingsDialogData: UserSettingsDialogData;

  constructor(public dialog: MatDialog,
    @Inject(currentUser) private currentUser: any,
    private constants: DoubtfireConstants,
    private userSettingsDialogServive: UserSettingsDialogService) {
    this.userSettingsDialogData = {
      externalName: '',
      user: {},
      currentUser: currentUser,
      isNew: false
    }
  }

  show(user: any) {
    this.userSettingsDialogData.user = user;
    this.dialog.open(UserSettingsDialogContent,
      {
        width: '900px',
        data: this.userSettingsDialogData
      });
  }
}