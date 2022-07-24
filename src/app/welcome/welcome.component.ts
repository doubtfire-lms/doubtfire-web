import { Component, OnInit } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { UserService } from 'src/app/api/services/user.service';
import { StateService } from '@uirouter/core';
import { AuthenticationService } from '../api/services/authentication.service';
import { GlobalStateService } from '../projects/states/index/global-state.service';

@Component({
  selector: 'f-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(
    private constants: DoubtfireConstants,
    private userService: UserService,
    private state: StateService,
    private authService: AuthenticationService,
    private globalState: GlobalStateService
  ) {}

  public externalName = this.constants.ExternalName;
  public user = this.userService.currentUser;
  public formPronouns = { pronouns: '' };
  public get customPronouns(): boolean {
    return this.formPronouns.pronouns === '__customPronouns';
  }

  ngOnInit(): void {
    this.globalState.hideHeader();
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
    this.user.hasRunFirstTimeSetup = true;
    this.user.pronouns = this.customPronouns ? this.user.pronouns : this.formPronouns.pronouns;

    this.userService.update(this.user).subscribe({
      next: (response) => {
        this.userService.save(response);
        this.state.go('home');
      },
      error: (error) => console.log(error),
    });
  }
}
