import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import { User, UserService } from 'src/app/api/models/doubtfire-model';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'user-settings-modal',
  templateUrl: 'user-settings-modal.component.html',
  styleUrls: ['user-settings-modal.component.scss'],
})
export class UserSettingsModalComponent implements OnInit {
  // create or not
  isNew: boolean = true;
  // user information list
  user: User | null;

  externalName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(currentUser) public CurrentUser: any,
    public dialogRef: MatDialogRef<UserSettingsModalComponent>,
    private constants: DoubtfireConstants,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.constants.ExternalName.subscribe((result) => {
      this.externalName = result;
    })

    // edit detail
    if (this.data.id) {
      this.isNew = false;
      // send user data
      this.user = this.data;

      // or search basic on ID
      // this.userService.query({ id: this.data.id }).subscribe((data) => {
      //   this.user = data[0]
      // })
    }
  }

  // create new user
  public createNewUser() {
    this.userService.create({
      user: this.user
    }).subscribe(response => {
      this.dialogRef.close();
    })
  }

  // user edit
  public updateExistingUser() {
    const { id, first_name, last_name } = this.user;
    this.userService.update(this.currentWebcalWith(this.user)).subscribe(response => {
      this.userService.save(response)
      this.dialogRef.close();
    })
  }

  // show example on table
  private currentWebcalWith(o: Partial<User>): User {
    return new User({ ...o });
  }

  saveUser() {
    if (this.isNew) {
      this.createNewUser()
    } else {
      this.updateExistingUser()
    }
  }
}
