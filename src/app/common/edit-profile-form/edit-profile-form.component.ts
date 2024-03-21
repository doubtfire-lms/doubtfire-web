import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StateService } from '@uirouter/core';
import { User } from 'src/app/api/models/user/user';
import { AuthenticationService } from 'src/app/api/services/authentication.service';
import { UserService } from 'src/app/api/services/user.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-edit-profile-form',
  templateUrl: './edit-profile-form.component.html',
  styleUrls: ['./edit-profile-form.component.scss'],
})
export class EditProfileFormComponent implements OnInit {
  constructor(
    private constants: DoubtfireConstants,
    private userService: UserService,
    private state: StateService,
    private authService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { user: User; mode: 'edit' | 'create' },
    private _snackBar: MatSnackBar
  ) {
    this.user = data?.user || this.userService.currentUser;
  }

  @Input() mode: 'edit' | 'create';
  public user: User;
  public externalName = this.constants.ExternalName;
  public initialFirstName: string;
  public formPronouns = { pronouns: '' };
  public get customPronouns(): boolean {
    return this.formPronouns.pronouns === '__customPronouns';
  }

  ngOnInit(): void {
    if (this.data?.mode) {
      this.mode = this.data.mode;
    }

    if (this.userService.isAnonymousUser()) {
      this.state.go('sign_in');
    }

    this.user.optInToResearch = false;
    this.user.receiveFeedbackNotifications = true;
    this.user.receivePortfolioNotifications = true;
    this.user.receiveTaskNotifications = true;
  }

  public signOut(): void {
    this.authService.signOut();
  }

  public get canEditSystemRole(): boolean {
    return !(this.user.id === this.userService.currentUser.id);
  }

  public get canSeeSystemRole(): boolean {
    return (
      this.userService.currentUser.systemRole === 'Admin' || this.userService.currentUser.systemRole === 'Convenor'
    );
  }

  public get tiiEnabled(): boolean {
    return this.constants.IsTiiEnabled.value;
  }

  public submit(): void {
    this.user.pronouns = this.customPronouns ? this.user.pronouns : this.formPronouns.pronouns;
    this.user.hasRunFirstTimeSetup = true;

    this.userService.update(this.user).subscribe({
      next: (updatedUser) => {
        if (this.mode === 'create') {
          this.state.go('home');
        } else {
          this.user = updatedUser;
          this.initialFirstName = this.user.firstName;

          // TODO: refactor into new alertService
          // this is a new snackbar alert test
          this._snackBar.open('Profile saved', 'dismiss', {
            duration: 1500,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        }
      },
      error: (error) => console.log(error),
    });
  }
}
