//
// Modal to show User Profile settings
//
import { Component, Inject, Injectable } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { analyticsService, auth, currentUser, alertService } from 'src/app/ajs-upgraded-providers';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { UserService } from 'src/app/api/models/user/user.service';
import { User } from 'src/app/api/models/user/user';

interface UserSettingsDialogData {
  user: User;
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
    @Inject(alertService) private alerts: any,
    @Inject(analyticsService) private analyticsService: any,
    private dialog: MatDialogRef<UserSettingsDialog>,
    private user: UserService
  ) { }

  private createNewUser() {
    this.user.create(this.data.user).subscribe(
      result => {
        this.alerts.add('success', `Created ${result.first_name} ${result.last_name} successfully`, 2000);
        this.user.query().subscribe(
          users => users.push(result));
      },
      error => this.alerts.add('danger', `Error creating user. ${(error != null ? error : undefined)}`, 2000));
  }

  private updateExistingUser() {
    this.user.update(this.data.user).subscribe(
      result => {
        this.alerts.add('success', `Updated ${result.first_name} ${result.last_name} successfully`, 2000);
        this.data.user.name = `${this.data.user.first_name} ${this.data.user.last_name}`;
        if (this.data.user === this.data.currentUser.profile) {
          this.auth.saveCurrentUser();
          if (this.data.user.opt_in_to_research) {
            this.analyticsService.event('Doubtfire Analytics', 'User opted in research');
          }
        }
      },
      error => this.alerts.add('danger', `Error creating user. ${(error != null ? error : undefined)}`, 2000));
  }

  saveUser() {
    this.data.isNew ? this.createNewUser() : this.updateExistingUser();
    this.dialog.close();
  }
}

@Injectable()
export class UserSettingsDialog {
  userSettingsDialogData: UserSettingsDialogData;
  constructor(public dialog: MatDialog,
    @Inject(currentUser) private currentUser: User,
    private constants: DoubtfireConstants) {
    const user = new User();
    this.userSettingsDialogData = {
      externalName: '',
      user: user,
      currentUser: this.currentUser,
      isNew: false
    };
  }

  show(user: User) {
    this.userSettingsDialogData.user = user;
    this.userSettingsDialogData.isNew = !user.id;
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
