import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/api/models/user.service';

@Component({
  selector: 'user-notification-modal',
  templateUrl: 'user-notification-settings-modal.html',
  styleUrls: ['user-notification-settings-modal.scss']
})
export class UserNotificationSettingsModalContent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) {}

  saveSettings(): void {
    this.userService.update(this.data);
    this.userService.save(this.data);
  }
}

@Injectable()
export class UserNotificationSettingsModal {
  constructor(public dialog: MatDialog) {}

  show(user: any) {
    this.dialog.open(UserNotificationSettingsModalContent, {
      width: '365px',
      data: user
    });
  }
}
