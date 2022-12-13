import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { StateService, Transition } from '@uirouter/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { AuthenticationService } from 'src/app/api/services/authentication.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';

type signInData =
  | {
      username: string;
      password: string;
      remember: boolean;
    }
  | {
      auth_token: string;
      username: string;
      remember: boolean;
      password?: string;
    };
@Component({
  selector: 'f-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  signingIn: boolean;
  invalidCredentials: boolean;
  api: string;
  SSOLoginUrl: any;
  authMethodLoaded: boolean;
  externalName: any;
  formData: signInData;
  constructor(
    private authService: AuthenticationService,
    private state: StateService,
    private constants: DoubtfireConstants,
    private http: HttpClient,
    private transition: Transition,
    private globalState: GlobalStateService,
    @Inject(alertService) private alerts: any
  ) {}

  ngOnInit(): void {
    this.formData = { username: '', password: '', remember: false };
    // Check for SSO
    this.globalState.hideHeader();
    this.api = this.constants.API_URL;
    this.externalName = this.constants.ExternalName;

    // wait 15 seconds with rxjs
    const wait = new Promise((resolve) => setTimeout(resolve, 15000));
    this.http.get(`${this.constants.API_URL}/auth/method`).subscribe((response: any) => {
      // if there is a string in response.data.redirect_to
      this.SSOLoginUrl = response.redirect_to || false;

      if (this.SSOLoginUrl) {
        if (this.transition.params().authToken) {
          // This is SSO and we just got an auth_token? Must request to sign in
          return this.sign_in({
            auth_token: this.transition.params().authToken,
            username: this.transition.params().authToken,
            remember: true,
          });
        } else {
          // We are SSO and no auth token so we can must redirect to SSO login provider
          return window.location.assign(this.SSOLoginUrl);
        }
      } else {
        this.authMethodLoaded = true;
        return wait.then();
      }
    }),
      function (err) {
        this.authMethodFailed = true;
        this.error = err;

        // return after waiting 1500 with the wait promise
        return wait.then();
      };

    if (this.authService.isAuthenticated()) {
      this.state.go('home');
    } else {
      // this.sign_in = () =>
      //   this.sign_in({
      //     username: this.session.username,
      //     password: this.session.password,
      //     remember: this.session.remember_me,
      //   });
    }
  }

  sign_in(signInCredentials: signInData): void {
    signInCredentials.remember = true;
    this.signingIn = true;

    this.authService.signIn(signInCredentials).subscribe({
      next: () => {
        this.alerts.clearAll();
        this.state.go('home');
      },
      error: (err) => {
        this.signingIn = false;
        this.formData.password = '';
        this.invalidCredentials = true;
        this.alerts.add('warning', err, 6000);
      },
    });
  }
}
