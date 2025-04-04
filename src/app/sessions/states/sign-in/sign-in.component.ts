import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { StateService, Transition } from '@uirouter/core';
import { BehaviorSubject } from 'rxjs';
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
  public signingIn: boolean;
  public showCredentials: boolean = false;
  public invalidCredentials: boolean;
  public api: string;
  public SSOLoginUrl: string;
  public authMethodLoaded: boolean;
  public externalName: BehaviorSubject<string>;
  public formData: signInData;
  public isLoading: boolean = true;

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
      remember: localStorage.getItem(this.authService.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) == 'true',
      autoLogin: localStorage.getItem('autoLogin') == 'true',
    };
    // Check for SSO
    this.globalState.hideHeader();
    this.api = this.constants.API_URL;
    this.externalName = this.constants.ExternalName;

    this.attemptRefreshTokenSignIn();

    // wait 2 seconds with rxjs
    const wait = new Promise((resolve) => setTimeout(resolve, 2000));
    this.http.get(`${this.constants.API_URL}/auth/method`).subscribe((response: any) => {
      this.isLoading = false;

      // if there is a string in response.data.redirect_to
      this.SSOLoginUrl = response.redirect_to || false;

      if (this.SSOLoginUrl) {
        if (this.transition.params().authToken) {
          // This is SSO and we just got an auth_token? Must request to sign in
          return this.signIn({
            auth_token: this.transition.params().authToken,
            username: this.transition.params().username,
            remember: this.formData.remember,
          });
        } else if (this.formData.autoLogin) {
          return wait.then(() => {
            // Double check in case changed in the meantime
            if (this.formData.autoLogin && this.formData.remember) {
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

        // return after waiting with the wait promise
        return wait.then();
      };
  }

  /**
   * Perform the actions needed when the user successfully signs in.
   */
  private actionSignInSuccess(): void {
    this.globalState.loadGlobals();
    this.state.go('home');
  }

  /**
   * Try to sign in using the refresh token cookie.
   */
  private attemptRefreshTokenSignIn(): void {
    // Attempt to get an access token using the refresh token cookie
    this.authService.attemptLoginUsingRefreshToken((loggedIn: boolean) => {
      if (loggedIn) {
        this.actionSignInSuccess();
      }
    });
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

  /**
   * Sign in using the provided credentials. For SSO, this will redirect to the SSO login URL
   * if the auth token is not provided. Then when the api redirects hack to us, with the auth token,
   * we will then use the passed login auth token to get an access token.#form
   *
   * For all logins, if rememberMe is set, the api will also send a secure cookie
   * with the refresh token. This will be used to get an access token when the user
   * refreshes the page / returns to the app / etc.
   */
  public signIn(signInCredentials: signInData): void {
    // Save remember me state
    this.authService.rememberMe = signInCredentials.remember;

    // Redirect to SSO if we do not have an auth token already (from SSO callback)
    if (this.SSOLoginUrl && !signInCredentials.auth_token) {
      return this.redirectToSSO();
    }

    // Indicate we are signing in...
    this.signingIn = true;

    this.authService.signIn(signInCredentials).subscribe({
      next: () => {
        this.actionSignInSuccess();
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
