import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService} from '../projects/states/index/global-state.service';

@Component({
  selector: 'f-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  public loading = true;

  constructor(
    private constants: DoubtfireConstants,
    private globalState: GlobalStateService,
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {}

  public externalName = this.constants.ExternalName;

  ngOnInit(): void {
    this.globalState.hideHeader();

    this.authenticationService.afterAuthCall((result) => {
      if (!result) {
        return this.router.navigateByUrl('/sign_in');
      }

      this.loading = false;
    });
  }
}
