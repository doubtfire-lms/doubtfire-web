import { Injectable, Component, Inject } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UserService } from "src/app/api/models/user/user.service";
import { User } from "src/app/api/models/user/user";

@Component({
  selector: "user-notification-modal",
  templateUrl: "user-notification-settings-modal.html",
  styleUrls: ["user-notification-settings-modal.scss"]
})
export class UserNotificationSettingsModalContent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User,
    private userService: UserService
  ) { }

  saveSettings(): void {
    // let x = new User();
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


    // x.id = 1;
    // x.last_name = "REKT2";
    // this.userService.update(x).subscribe(data => console.log(data));
    // this.userService.get(1).subscribe(data => console.log("here" + data.last_name),
    //   error => console.error(error));
    this.userService.update(this.data).subscribe(result => console.log(result));
    // console.log("updating new User");
    // this.userService.update(new User()).subscribe(result => console.log(result));
  }
}

@Injectable()
export class UserNotificationSettingsModal {
  constructor(public dialog: MatDialog) { }

  show(user: User) {
    this.dialog.open(UserNotificationSettingsModalContent, {
      width: "365px",
      data: user
    });
  }
}
