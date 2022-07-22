import { Component, OnInit } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { UserService } from 'src/app/api/services/user.service';
import { StateService } from '@uirouter/core';

@Component({
  selector: 'f-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(private constants: DoubtfireConstants, private userService: UserService, private state: StateService) {}

  public externalName = this.constants.ExternalName;
  public user = this.userService.currentUser;
  public formPronouns = { pronouns: '' };
  public get customPronouns(): boolean {
    return this.formPronouns.pronouns === '__customPronouns';
  }

  ngOnInit(): void {
    this.user.optInToResearch = false;
    this.user.receiveFeedbackNotifications = true;
    this.user.receivePortfolioNotifications = true;
    this.user.receiveTaskNotifications = true;
  }

  public signOut(): void {
    this.state.go('sign_out');
  }

  public submit(): void {
    this.user.hasRunFirstTimeSetup = true;
    this.user.pronouns = this.customPronouns ? this.user.pronouns : this.formPronouns.pronouns;

    this.userService.update(this.user).subscribe({
      next: (response) => {
        this.user = response;
        this.state.go('home');
      },
      error: (error) => console.log(error),
    });
  }
}
