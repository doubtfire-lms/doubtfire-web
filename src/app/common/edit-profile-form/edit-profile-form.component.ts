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
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { user: User; mode: 'edit' | 'create' | 'new' },
    private _snackBar: MatSnackBar
  ) {
    this.user = data?.user || this.userService.currentUser;
  }

  /**
   * The mode of the form, either 'edit', 'create', or 'new'
   * edit is for editing an existing user
   * create is used on first login
   * new is used for creating a new user
   */
  @Input() mode: 'edit' | 'create' | 'new';

  public user: User;
  public externalName = this.constants.ExternalName;
  public initialFirstName: string;
  public formPronouns = { pronouns: '' };
  public themes = ['default', 'black-and-white'];
  public selectedTheme: 'default' | 'black-and-white' = 'default';

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

    this.selectedTheme = this.user.themePreference || 'default';
    this.applyTheme(this.selectedTheme);

    this.user.optInToResearch = false;
    this.user.receiveFeedbackNotifications = true;
    this.user.receivePortfolioNotifications = true;
    this.user.receiveTaskNotifications = true;
  }

  public signOut(): void {
    this.authService.signOut();
  }

  public get newUser(): boolean {
    return this.mode === 'new';
  }

  public get canEditSystemRole(): boolean {
    return !(this.user.id === this.userService.currentUser.id);
  }

  public get canSeeSystemRole(): boolean {
    return (
      this.userService.currentUser.systemRole === 'Admin' ||
      this.userService.currentUser.systemRole === 'Convenor'
    );
  }

  public get tiiEnabled(): boolean {
    return this.constants.IsTiiEnabled.value;
  }

  public applyTheme(theme: 'default' | 'black-and-white'): void {
    document.body.classList.remove('theme-default', 'theme-black-and-white');
    document.body.classList.add(`theme-${theme}`);
  }

  public submit(): void {
    this.user.pronouns = this.customPronouns ? this.user.pronouns : this.formPronouns.pronouns;
    this.user.hasRunFirstTimeSetup = true;
    this.user.themePreference = this.selectedTheme;
    this.applyTheme(this.selectedTheme);

    if (this.newUser) {
      this.userService.create(this.user).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.initialFirstName = this.user.firstName;

          this._snackBar.open('User created', 'dismiss', {
            duration: 1500,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
        error: (error) => console.log(error),
      });
    } else {
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
}
