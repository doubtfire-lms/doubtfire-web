import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';

// Add fallback to check url for query parameters
type IParams = Record<string, string>;

const paramReducer = (params: IParams, pair: string): IParams => {
  const [key, value] = `${pair}=`.split('=').map(decodeURIComponent);

  return key.length > 0 ? {...params, [key]: value} : params;
};

const getUrlParams = (search: string): IParams =>
  `${search}?`.split('?')[1].split('&').reduce<IParams>(paramReducer, {});

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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
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
  public authMethodFailed: boolean = false;

  public redirectingSSO: boolean = false;

  // Get query params from the resolve in the router state
  @Input() username: string;
  @Input() authToken: string;
  @Input() ltiToken: string;
  @Input() ltik: string;
  @Input() isLtiLogin: boolean;

  constructor(
    public authService: AuthenticationService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private constants: DoubtfireConstants,
    private http: HttpClient,
    private globalState: GlobalStateService,
    private alerts: AlertService,
  ) {}

  ngOnInit(): void {
    this.authService.afterAuthCall((result) => {
      if (result) {
        const params = getUrlParams(document.location.href);
        this.isLoading = false;

        if (params.isLtiLogin && params.ltik) {
          this.globalState.hideHeader();
          this.userService.currentUser.ltik = params.ltik;
          return this.router.navigate(['/lti'], {queryParams: {ltik: params.ltik}});
        } else if (this.userService.currentUser.hasRunFirstTimeSetup === false) {
          return this.router.navigateByUrl('/welcome');
        } else {
          this.globalState.goHome();
          return this.router.navigateByUrl('/home');
        }
      }
      this.isLoading = true;
    });

    this.globalState.onLoad(() => this.initAfterGlobalLoad());
  }

  private initAfterGlobalLoad(): void {
    if (!this.isLoading) {
      // return out if we're already redirecting elsewhere in the afterAuthCall
      return;
    }

    this.formData = {
      username: '',
      password: '',
      remember: this.authService.rememberMe,
      autoLogin: this.autoLogin,
    };
    // Check for SSO
    this.globalState.hideHeader();
    this.api = this.constants.API_URL;
    this.externalName = this.constants.ExternalName;

    const queryParams = this.route.snapshot.queryParams;
    const params = getUrlParams(document.location.href);
    if (!this.username) {
      this.username = queryParams.username || params.username;
      this.authToken = queryParams.authToken || params.authToken;
    }

    this.ltiToken = queryParams.ltiToken || params.ltiToken || undefined;
    this.ltik = queryParams.ltik || params.ltik || undefined;
    this.isLtiLogin =
      (queryParams.isLtiLogin || params.isLtiLogin)?.toLowerCase() === 'true' ? true : false;

    // wait 2 seconds with rxjs
    const wait = new Promise((resolve) => setTimeout(resolve, 3000));
    this.http.get(`${this.constants.API_URL}/auth/method`).subscribe({
      next: (response: {redirect_to?: string}) => {
        this.isLoading = false;

        // if there is a string in response.data.redirect_to
        this.SSOLoginUrl = response.redirect_to || '';

        if (this.authToken) {
          // We have an auth token - so attempt to convert to access token
          return this.signIn({
            auth_token: this.authToken,
            username: this.username,
            remember: this.authService.rememberMe,
          });
        } else if (this.ltiToken) {
          // We have a signed Lti token containing user data
          // Forward it to the API and request a one time auth token
          this.signingIn = true;

          this.authService
            .signInWithLti({
              ltik: this.ltik,
              lti_token: this.ltiToken,
            })
            .subscribe({
              next: () => {
                // this.globalState.goHome();
                // this.actionSignInSuccess();
              },
              error: (err) => {
                this.signingIn = false;
                this.formData.password = '';
                this.invalidCredentials = true;
                this.alerts.error(err, 6000);
              },
            });
        } else if (this.SSOLoginUrl) {
          if (this.autoLogin) {
            this.redirectingSSO = true;
            return wait.then(() => {
              // Double check in case changed in the meantime
              if (this.autoLogin) {
                this.redirectToSSO();
              } else {
                this.redirectingSSO = false;
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
      },
      error: (_err) => {
        this.authMethodFailed = true;
        // this.error = err;

        // return after waiting with the wait promise
        return wait.then();
      },
    });
  }

  public get autoLogin(): boolean {
    // Check if autoLogin is set in localStorage
    return localStorage.getItem('autoLogin') === 'true';
  }

  public set autoLogin(value: boolean) {
    // Set autoLogin in localStorage
    localStorage.setItem('autoLogin', value ? 'true' : 'false');
  }

  /**
   * Perform the actions needed when the user successfully signs in.
   */
  private actionSignInSuccess(): void {
    this.router.navigateByUrl(
      this.userService.currentUser.hasRunFirstTimeSetup === false ? '/welcome' : '/home',
    );
  }

  /**
   * Redirects the window to the SSO login URL, if the SSO login URL is set.
   */
  private redirectToSSO(): void {
    if (this.SSOLoginUrl) {
      if (this.autoLogin) {
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
    // Redirect to SSO if we do not have an auth token already (from SSO callback)
    if (this.SSOLoginUrl && !signInCredentials.auth_token) {
      return this.redirectToSSO();
    }

    // Indicate we are signing in...
    this.signingIn = true;

    this.authService.signIn(signInCredentials).subscribe({
      next: () => {
        if (this.isLtiLogin) {
          const params = getUrlParams(document.location.href);
          this.router.navigate(['/lti'], {queryParams: {ltik: params.ltik}});
        } else {
          this.actionSignInSuccess();
        }
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
