import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { StateService, Transition } from '@uirouter/core';
import { AuthenticationService } from 'src/app/api/services/authentication.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';

type signInData =
  | {
      username: string;
      password: string;
      remember: boolean;
      autoLogin: boolean;
      auth_token?: string;
    }
  | {
      auth_token: string;
      username: string;
      remember: boolean;
      password?: string;
      autoLogin?: boolean;
    };
@Component({
  selector: 'f-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  signingIn: boolean;
  showCredentials = false;
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
    private alerts: AlertService,
  ) {}

  ngOnInit(): void {
    this.formData = {
      username: '',
      password: '',
      remember: false,
      autoLogin: localStorage.getItem('autoLogin') ? true : false,
    };
    // Check for SSO
    this.globalState.hideHeader();
    this.api = this.constants.API_URL;
    this.externalName = this.constants.ExternalName;

    // wait 2 seconds with rxjs
    const wait = new Promise((resolve) => setTimeout(resolve, 2000));
    this.http.get(`${this.constants.API_URL}/auth/method`).subscribe((response: any) => {
      // if there is a string in response.data.redirect_to
      this.SSOLoginUrl = response.redirect_to || false;

      if (this.SSOLoginUrl) {
        if (this.transition.params().authToken) {
          // This is SSO and we just got an auth_token? Must request to sign in
          return this.signIn({
            auth_token: this.transition.params().authToken,
            username: this.transition.params().username,
            remember: true,
          });
        } else if (this.formData.autoLogin) {
          return wait.then(() => {
            // Double check in case changed in the meantime
            if (this.formData.autoLogin) {
              this.redirectToSSO();
            }
          });
        } else {
          this.globalState.isLoadingSubject.next(false);
          // We are SSO and no credentials
          this.showCredentials = false;
          return wait.then();
        }
      } else {
        this.globalState.isLoadingSubject.next(false);
        this.authMethodLoaded = true;
        this.showCredentials = true;
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
    }
  }

  /**
   * Redirects the window to the SSO login URL, if the SSO login URL is set.
   */
  private redirectToSSO(): void {
    if (this.SSOLoginUrl) {
      if (this.formData.autoLogin) {
        localStorage.setItem('autoLogin', 'true');
      } else {
        localStorage.removeItem('autoLogin');
      }

      window.location.assign(this.SSOLoginUrl);
    }
  }

  signIn(signInCredentials: signInData): void {
    if (this.SSOLoginUrl && !signInCredentials.auth_token) {
      return this.redirectToSSO();
    }

    signInCredentials.remember = true;
    this.signingIn = true;

    this.authService.signIn(signInCredentials).subscribe({
      next: () => {
        this.state.go('home');
      },
      error: (err) => {
        this.signingIn = false;
        this.formData.password = '';
        this.invalidCredentials = true;
        this.alerts.error(err, 6000);
      },
    });
  }
}
