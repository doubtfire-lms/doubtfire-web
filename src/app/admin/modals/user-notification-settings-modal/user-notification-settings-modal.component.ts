import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/api/models/user/user.service';
import { User } from 'src/app/api/models/user/user';

@Component({
  selector: 'user-notification-modal',
  templateUrl: 'user-notification-settings-modal.html',
  styleUrls: ['user-notification-settings-modal.scss']
})
export class UserNotificationSettingsModalContent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User,
    private userService: UserService
  ) { }

  handleUpdate(user: User) {
    user.last_name = 'TEST';
    this.userService.update(user).subscribe(result => console.log(result));
  }

  saveSettings(): void {
    this.data = new User();
    // let x = new User();
    // x.first_name = 'Jake';
    // x.last_name = 'Rest';
    // x.email = 'jake@jake.jake';
    // x.username = 'jake';
    // x.nickname = 'jake';
    // x.system_role = 'admin';

    // this.userService.query().subscribe(result => console.log(result));
    // this.userService.get({ id: 1 }).subscribe(result => console.log(result));
    this.userService.get(1).subscribe(result => console.log(result));
    this.userService.get(1).subscribe(result => this.handleUpdate(result));

    // this.userService.update(this.data).subscribe(result => console.log(result));

    // this.userService.create(x).subscribe(data => console.log(data));
    // this.userService.get(1).subscribe(data => x = data);
    // this.userService.get(1).subscribe(data => x = data);
    // this.userService.get(1).subscribe(data => x = data);
    // this.userService.get(1).subscribe(data => x = data);
    // this.userService.get(1).subscribe(data => console.log(data.last_name));
    // this.userService.get(1).subscribe(data => console.log(data.last_name));
    // this.userService.get(2).subscribe(data => console.log(data.last_name));
    // this.userService.get(2).subscribe(data => console.log(data.last_name));
    // this.userService.get(1).subscribe(data => console.log(data.last_name));
    // this.userService.get(2).subscribe(data => console.log(data.last_name));

    // this.userService.list().subscribe(data => console.log(data));



    // this.userService.update(x).subscribe(data => console.log(data));
    // this.userService.get(1).subscribe(data => console.log('here' + data.last_name),
    //   error => console.error(error));
    // this.userService.update(this.data).subscribe(result => console.log(result));
    // console.log('updating new User');
    // this.userService.update(new User()).subscribe(result => console.log(result));
  }
}

@Injectable()
export class UserNotificationSettingsModal {
  constructor(public dialog: MatDialog) { }

  show(user: User) {
    this.dialog.open(UserNotificationSettingsModalContent, {
      width: '365px',
      data: user
    });
  }
}
