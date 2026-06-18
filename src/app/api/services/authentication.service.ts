import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AsyncSubject, Observable, catchError, map, throwError} from 'rxjs';
import {User, UserService} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

/**
 * The format for the data returned from the auth api.
 */
interface AuthResponse {
  user: object;
  auth_token: string;
  auth_token_expiry: string;
  lti_token?: string;
}

@Injectable()
export class AuthenticationService {
  /**
   * The URL for the authentication API endpoint
   */
  private readonly AUTH_URL: string;

  /**
   * The key used to store the username in local storage - now removed.
   */
  public readonly USERNAME_KEY: string = 'doubtfire_user';

  /**
   * The key used to store the remember me option in local storage.
   */
  public readonly REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN: string =
    'remember_doubtfire_credentials_token';

  /**
   * AsyncSubject to indicate when the authentication process is complete.
   */
  private authComplete$: AsyncSubject<boolean> = new AsyncSubject<boolean>();

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private alertService: AlertService,
    private angularRouter: Router,
    private doubtfireConstants: DoubtfireConstants,
  ) {
    this.AUTH_URL = `${this.doubtfireConstants.API_URL}/auth`;
    // Ensure any only user data is removed from local storage
    localStorage.removeItem(this.USERNAME_KEY);
  }

  private actionAuthFailed() {
    this.signOut(false);
  }

  /**
   * Attempt to login using the refresh token secure cookie.
   * This requires the remember option to be true - and the server to have sent a
   * secure cookie.
   * @param loginResultCallback - Callback function to indicate success or failure of login.
   */
  public attemptLoginUsingRefreshToken(
    loginResultCallback: (result: boolean) => void,
    firstTime: boolean = true,
  ): void {
    // Check we have indication of secure cookie in local storage
    const remember: boolean = this.rememberMe;

    if (!remember) {
      loginResultCallback(false);
      return;
    }

    // Attempt to get an access token using the refresh token cookie
    this.httpClient.post(this.AUTH_URL + '/access-token', {}).subscribe({
      next: (response: AuthResponse | null) => {
        if (response && response.auth_token) {
          this.setupUserFromResponse(response, firstTime);
          loginResultCallback(true);
        } else {
          this.actionAuthFailed();
          loginResultCallback(false);
        }
      },
      error: (_error) => {
        // Will occur on 404 when the refresh token cookie is not present
        this.actionAuthFailed();
        loginResultCallback(false);
      },
    });
  }

  /**
   * Check if the user is authenticated.
   *
   * @returns true if the user is authenticated, false otherwise.
   */
  public isAuthenticated(): boolean {
    return (
      this.userService.currentUser.id !== undefined &&
      !!this.userService.currentUser.authenticationToken
    );
  }

  public get rememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) !== 'false';
  }

  public set rememberMe(remember: boolean) {
    localStorage.setItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN, remember ? 'true' : 'false');
  }

  /**
   * Get a new access token - and delete the old one.
   *
   * @returns void
   */
  private cycleAccessToken() {
    const remember: boolean = this.rememberMe;

    // We cant get a new token if there is no refresh token cookie
    if (!this.isAuthenticated() || !remember) {
      return;
    }

    // Attempt to get a new access token using the refresh token cookie
    this.attemptLoginUsingRefreshToken((result: boolean) => {
      if (result) {
        console.log('Successfully refreshed access token');
      }
    });
  }

  private readonly validRoles: string[] = [
    'anon',
    'Student',
    'Tutor',
    'Convenor',
    'Admin',
    'Auditor',
  ];

  private isValidRoleWhitelist(roleWhitelist: string[]) {
    return roleWhitelist.filter((role: string) => this.validRoles.includes(role)).length !== 0;
  }

  public isAuthorised(roleWhitelist: string[], role?: string): boolean {
    if (!role) {
      role = this.userService.currentUser.role;
    }

    return (
      roleWhitelist.length > 0 &&
      this.isValidRoleWhitelist(roleWhitelist) &&
      roleWhitelist.includes(role)
    );
  }

  /**
   * Use the user service to get or create a user object, and update it
   * from the response. Ensure that the authentication token is set.
   *
   * @param response the response from the authentication API
   */
  private setupUserFromResponse(response: AuthResponse, firstTime: boolean = true): void {
    // Extract relevant data from response and construct user object to store in cache.
    const user: User = this.userService.cache.getOrCreate(
      response.user['id'],
      this.userService,
      response.user,
    );

    // Set the user's authentication token for access to api.
    user.authenticationToken = response['auth_token'];
    user.authenticationTokenExpiry = response['auth_token_expiry'];

    // Record the current user
    this.userService.currentUser = user;

    if (firstTime) {
      // Load everything!
      AppInjector.get(GlobalStateService).loadGlobals();
      // Update token in one hour
      setTimeout(() => this.cycleAccessToken(), 1000 * 60 * 60);
    }

    // Inidcate that the authentication was successful
    this.authComplete$.next(true);
    this.authComplete$.complete();
  }

  /**
   * Register a callback to be called when the authentication process is complete.
   * This is used by the runtime.coffee for now to check authorisation after login
   * completes. The callback will be called with true if user is authorised and if
   * not will redirect to another page.
   *
   * @param callback the callback function to call
   */
  public afterAuthCall(callback: (result: boolean) => void): void {
    this.authComplete$.subscribe({
      next: (result) => {
        callback(result);
      },
    });
  }

  public signIn(
    userCredentials:
      | {
          username: string;
          password: string;
          remember: boolean;
        }
      | {
          auth_token: string;
          username: string;
          remember: boolean;
        },
  ): Observable<void> {
    return this.httpClient.post(this.AUTH_URL, userCredentials).pipe(
      map((response: AuthResponse) => {
        this.setupUserFromResponse(response);
      }),
      catchError((error) => {
        // this.authComplete$.next(false);
        // this.authComplete$.complete();

        return throwError(() => error);
      }),
    );
  }

  public signInWithLti(userCredentials: {ltik: string; lti_token: string}): Observable<void> {
    return this.httpClient.post(`${this.AUTH_URL}/lti`, userCredentials).pipe(
      map((response: AuthResponse) => {
        const username = encodeURIComponent(response.user['username']);
        const authToken = encodeURIComponent(response.auth_token);
        const ltik = encodeURIComponent(userCredentials.ltik);
        setTimeout(() => {
          window.location.href = `/sign_in?username=${username}&authToken=${authToken}&ltik=${ltik}&isLtiLogin=true`;
        });
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  public signOut(ssoSignOut = true): void {
    // This function is called after the token is deleted...
    const doSignOut = () => {
      // Setup ability to auth again
      this.authComplete$.complete();
      this.authComplete$ = new AsyncSubject<boolean>();

      // Change the current user to the anonymous user
      this.userService.currentUser = this.userService.anonymousUser;

      // Clear global state
      const globalStateService = AppInjector.get(GlobalStateService);
      globalStateService.clearUnitsAndProjects();
      this.userService.cache.clear();

      // Trigger the UI changes
      globalStateService.hideHeader();
      globalStateService.setView(ViewType.OTHER);

      // if we have a signout URL, redirect to it
      if (ssoSignOut && this.doubtfireConstants.SignoutURL) {
        window.location.assign(this.doubtfireConstants.SignoutURL);
      } else {
        this.angularRouter.navigateByUrl('/sign_in');
      }
    };

    // If we have a token, delete it...
    if (this.userService.currentUser.authenticationToken) {
      this.httpClient.delete(this.AUTH_URL, {params: {remember: false}}).subscribe({
        next: (_response) => doSignOut(),
        error: (_response) => doSignOut(),
      });
    } else {
      doSignOut();
    }
  }

  public timeoutAuthentication(): void {
    if (window.location.pathname !== '/timeout') {
      this.alertService.error('Authentication timed out', 6000);
      setTimeout(() => this.angularRouter.navigateByUrl('/timeout'), 500);
    }
  }

  public getScormToken(): Observable<string> {
    return this.httpClient.get(this.AUTH_URL + '/scorm').pipe(
      map((response) => {
        return response['scorm_auth_token'];
      }),
    );
  }
}
