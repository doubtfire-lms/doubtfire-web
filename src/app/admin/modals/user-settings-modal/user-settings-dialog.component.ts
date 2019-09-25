//
// Modal to show User Profile settings
//
import { Component, Inject, Injectable } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { analyticsService, auth, currentUser } from 'src/app/ajs-upgraded-providers';
import { UserSettingsDialogService } from '../user-settings-modal/user-settings-dialog.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

interface UserSettingsDialogData {
  user: any;
  currentUser: any;
  externalName: string;
  isNew: boolean;
}

@Component({
  selector: 'user-settings-dialog',
  templateUrl: 'user-settings-dialog.component.html',
})
export class UserSettingsDialogContent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserSettingsDialogData,
    @Inject(auth) private auth: any,
    @Inject(analyticsService) private analyticsService: any,
    private userSettingsDialogService: UserSettingsDialogService
  ) { }

  private createNewUser() {
    this.userSettingsDialogService.createUser(this.data.user).subscribe(result => {
      if (this.data.isNew) {
        this.userSettingsDialogService.queryUsers().subscribe(users => {
          users.push(result);
        });
      }
    });
  }

  private updateExistingUser() {
    this.userSettingsDialogService.updateUser(this.data.user).subscribe(result => {
      this.data.user.name = `${this.data.user.first_name} ${this.data.user.last_name}`;
      if (this.data.user === this.data.currentUser.profile) {
        this.auth.saveCurrentUser();
        if (this.data.user.opt_in_to_research) {
          this.analyticsService.event('Doubtfire Analytics', 'User opted in research');
        }
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
    @Inject(currentUser) private currentUser: any,
    private constants: DoubtfireConstants) {
    this.userSettingsDialogData = {
      externalName: '',
      user: {},
      currentUser: this.currentUser,
      isNew: false
    };
  }

  show(user: any) {
    this.userSettingsDialogData.user = user;
    this.getExternalName();
    this.dialog.open(UserSettingsDialogContent,
      {
        data: this.userSettingsDialogData
      });
  }

  private getExternalName(): void {
    this.constants.ExternalName
      .subscribe(result => {
        this.userSettingsDialogData.externalName = result;
      });
  }
}
