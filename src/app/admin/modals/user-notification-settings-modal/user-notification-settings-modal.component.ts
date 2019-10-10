import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/api/models/user/user.service';
import { User } from 'src/app/api/models/user/user';
import { Campus } from 'src/app/api/models/campus/campus';
import { CampusService } from 'src/app/api/models/campus/campus.service';

@Component({
  selector: 'user-notification-modal',
  templateUrl: 'user-notification-settings-modal.html',
  styleUrls: ['user-notification-settings-modal.scss']
})
export class UserNotificationSettingsModalContent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User,
    private userService: UserService,
  ) { }

  saveSettings(): void {
    this.userService.update(this.data).subscribe(() => this.userService.save(this.data));
  }
}

@Injectable()
export class UserNotificationSettingsModal {
  constructor(public dialog: MatDialog) { }

  show(user: User) {
    // TODO: This needs to be thought about...
    let u = new User();
    u.updateFromJson(user);
    this.dialog.open(UserNotificationSettingsModalContent, {
      width: '365px',
      data: u
    });
  }
}
