//
// Modal to show User Profile settings
//
import { Injectable, Component, Inject } from '@angular/core';
import { UserSettingsDialogService } from '../user-settings-modal/user-settings-dialog.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';

interface UserSettingsDialogData {
  user: any,
  externalName: string,
  isNew: boolean,
  service: any
}

@Component({
  selector: 'user-settings-dialog',
  templateUrl: 'user-settings-dialog.component.html',
})
export class UserSettingsDialogContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserSettingsDialogData, @Inject(auth) private auth: any,
    @Inject(analyticsService) private analyticsService: any, @Inject(currentUser) private currentUser: any) { }

  private createNewUser() {
    this.data.service.createUser(this.data.user).subscribe(result => { });
  }

  private updateExistingUser() {
    this.data.service.updateUser(this.data.user).subscribe(result => {
      this.data.user.name = `${this.data.user.first_name} ${this.data.user.last_name}`;
      if (this.data.user == this.currentUser.profile) {
        this.auth.saveCurrentUser();
        if (this.data.user.opt_in_to_research)
          this.analyticsService.event("Doubtfire Analytics", "User opted in research");
      }
    });
  }

  saveUser() {
    this.data.isNew ? this.createNewUser() : this.updateExistingUser();
  }
}

@Injectable()
export class UserSettingsDialog {

  userSettingsDialogData: UserSettingsDialogData;

  constructor(public dialog: MatDialog,
    private constants: DoubtfireConstants,
    private userSettingsDialogServive: UserSettingsDialogService) {
    this.userSettingsDialogData = {
      externalName: '',
      user: {},
      isNew: false,
      service: userSettingsDialogServive,
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