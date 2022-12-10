import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StateService } from '@uirouter/core';
import { User } from 'src/app/api/models/user/user';
import { AuthenticationService } from 'src/app/api/services/authentication.service';
import { UserService } from 'src/app/api/services/user.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { AlertService, AlertType } from '../services/alert.service';

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
    private alertService: AlertService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { user: User },
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
    this.initialFirstName = this.user.firstName;

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

        }
      },
      error: (error) => {
        this.alertService.add(AlertType.DANGER, error);
      },
    });
  }
}
