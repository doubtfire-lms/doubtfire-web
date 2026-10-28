import {ChangeDetectionStrategy, Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {User} from 'src/app/api/models/user/user';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-edit-profile-form',
  templateUrl: './edit-profile-form.component.html',
  styleUrls: ['./edit-profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EditProfileFormComponent implements OnInit {
  constructor(
    private constants: DoubtfireConstants,
    private userService: UserService,
    private router: Router,
    private authService: AuthenticationService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: {user: User; mode: 'edit' | 'create' | 'new'; modal: boolean},
    private _snackBar: MatSnackBar,
    private alertService: AlertService,
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
  @Input() modal: boolean = false;

  public user: User;
  public externalName = this.constants.ExternalName;
  public initialFirstName: string;
  public formPronouns = {pronouns: ''};
  public get customPronouns(): boolean {
    return this.formPronouns.pronouns === '__customPronouns';
  }

  ngOnInit(): void {
    if (this.data?.mode) {
      this.mode = this.data.mode;
    }
    if (this.data?.modal) {
      this.modal = this.data.modal;
    }

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

  public submit(): void {
    this.user.pronouns = this.customPronouns ? this.user.pronouns : this.formPronouns.pronouns;
    this.user.hasRunFirstTimeSetup = true;

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
        error: (error) => this.showSaveError(error, 'Unable to create user.'),
      });
    } else {
      this.userService.update(this.user).subscribe({
        next: (updatedUser) => {
          if (this.mode === 'create') {
            this.router.navigateByUrl('/home');
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
        error: (error) => this.showSaveError(error, 'Unable to save profile.'),
      });
    }
  }

  private showSaveError(error: unknown, fallbackMessage: string): void {
    this.alertService.error(this.extractErrorMessage(error) || fallbackMessage, 6000);
  }

  private extractErrorMessage(error: unknown): string | undefined {
    if (typeof error === 'string') {
      return error.trim() || undefined;
    }

    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const response = error as {error?: unknown; message?: unknown};
    if (typeof response.error === 'string') {
      return response.error.trim() || undefined;
    }

    if (response.error && typeof response.error === 'object') {
      const nestedError = (response.error as {error?: unknown}).error;
      if (typeof nestedError === 'string') {
        return nestedError.trim() || undefined;
      }
    }

    return typeof response.message === 'string' ? response.message.trim() || undefined : undefined;
  }
}
