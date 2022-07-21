import { Component, OnInit } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { interval } from 'rxjs';
import { UserService } from 'src/app/api/services/user.service';
import { StateService } from '@uirouter/core';

@Component({
  selector: 'f-welcome-wizard',
  templateUrl: './welcome-wizard.component.html',
  styleUrls: ['./welcome-wizard.component.scss'],
})
export class WelcomeWizardComponent implements OnInit {
  constructor(private constants: DoubtfireConstants, private userService: UserService, private state: StateService) {}

  public externalName = this.constants.ExternalName;
  public gradientObject = { val: 0 };
  public user = this.userService.currentUser;
  public pronouns = { pronouns: '' };
  public get customPronouns(): boolean {
    return this.pronouns.pronouns === '__customPronouns';
  }

  ngOnInit(): void {
    this.user.optInToResearch = false;
    this.user.receiveFeedbackNotifications = true;
    this.user.receivePortfolioNotifications = true;
    this.user.receiveTaskNotifications = true;
    interval(12000).subscribe(
      (_) => (this.gradientObject.val = this.gradientObject.val < 1 ? this.gradientObject.val + 1 : 0)
    );
  }

  public signOut(): void {
    this.state.go('sign_out');
  }

  public submit(): void {
    this.user.hasRunFirstTimeSetup = true;
    this.user.pronouns = this.pronouns.pronouns;
    this.userService.save(this.user);
    this.state.go('home');
  }
}
