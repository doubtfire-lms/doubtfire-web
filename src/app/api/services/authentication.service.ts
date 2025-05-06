import {User, UserService} from 'src/app/api/models/doubtfire-model';
import {Inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {StateService, UIRouter, UIRouterGlobals} from '@uirouter/angular';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';
import {AppInjector} from 'src/app/app-injector';
import {map, Observable} from 'rxjs';
import {AlertService} from 'src/app/common/services/alert.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private alertService: AlertService,
    private state: StateService,
    private doubtfireConstants: DoubtfireConstants,
    private router: UIRouter,
    private uiRouterGlobals: UIRouterGlobals,
  ) {
    this.AUTH_URL = `${this.doubtfireConstants.API_URL}/auth`;
  }

  public checkUserCookie(): void {
    const userData = JSON.parse(localStorage.getItem(this.USERNAME_KEY));
    const user = new User();
    Object.assign(user, userData);

    if (userData && this.tryChangeUser(user)) {
      // Ensure current user is in cache
      this.userService.cache.add(user);
      this.userService.currentUser = user;

      const resetTime = new Date(
        Number.parseInt(localStorage.getItem(this.DOUBTFIRE_LOGIN_TIME)) + 60 * 60 * 1000,
      );
      const waitTime = resetTime.valueOf() - new Date().valueOf();

      setTimeout(() => this.updateAuth(), waitTime);
    }
  }

  private readonly AUTH_URL: string;
  public readonly USERNAME_KEY: string = 'doubtfire_user';
  public readonly REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN: string =
    'remember_doubtfire_credentials_token';
  public readonly DOUBTFIRE_LOGIN_TIME: string = 'doubtfire_login_time';

  public saveCurrentUser(
    remember: boolean = localStorage.getItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) === 'true',
  ): void {
    if (remember && this.userService.currentUser.id) {
      localStorage.setItem(this.USERNAME_KEY, JSON.stringify(this.userService.currentUser));
      localStorage.setItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN, 'true');
      localStorage.setItem(this.DOUBTFIRE_LOGIN_TIME, JSON.stringify(new Date().getTime()));
    } else {
      localStorage.removeItem(this.USERNAME_KEY);
      localStorage.setItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN, 'false');
      localStorage.removeItem(this.DOUBTFIRE_LOGIN_TIME);
    }
  }

  public isAuthenticated(): boolean {
    return this.userService.currentUser.id !== undefined;
  }

  private updateAuth() {
    if (!this.isAuthenticated()) {
      return;
    }

    const remember: boolean =
      localStorage.getItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) === 'true';
    localStorage.setItem(this.DOUBTFIRE_LOGIN_TIME, JSON.stringify(new Date().getTime()));

    this.httpClient
      .put(this.AUTH_URL, {
        username: this.userService.currentUser.username,
        remember: remember,
      })
      .subscribe({
        next: (response) => {
          this.userService.currentUser.authenticationToken = response['auth_token'];
          this.saveCurrentUser(remember);

          // Update auth each hour
          setTimeout(() => this.updateAuth(), 1000 * 60 * 60);
        },
      });
  }

  private tryChangeUser(user: User, remember?: boolean) {
    if (user) {
      // Clear the current user object and populate it with the new values.
      // Note how the actual user object reference doesn't change.
      // delete currentUser[prop] for prop of currentUser
      // _.extend currentUser, user
      this.userService.currentUser = user;
      this.saveCurrentUser(remember);

      return true;
    } else {
      return false;
    }
  }

  private readonly validRoles: string[] = ['anon', 'Student', 'Tutor', 'Convenor', 'Admin', 'Auditor'];

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
  ): Observable<any> {
    return this.httpClient.post(this.AUTH_URL, userCredentials).pipe(
      map((response: any) => {
        // Extract relevant data from response and construct user object to store in cache.
        const user: User = this.userService.cache.getOrCreate(
          response['user']['id'],
          this.userService,
          response['user'],
        );

        user.authenticationToken = response['auth_token'];

        if (this.tryChangeUser(user, userCredentials.remember)) {
          AppInjector.get(GlobalStateService).loadGlobals();
        } else {
          return new Error('Failed to change user');
        }

        // Update token in one hour
        setTimeout(() => this.updateAuth(), 1000 * 60 * 60);
      }),
    );
  }

  public signOut(ssoSignOut = true): void {
    const doSignOut = () => {
      this.tryChangeUser(this.userService.anonymousUser, false);
      const globalStateService = AppInjector.get(GlobalStateService);
      globalStateService.hideHeader();
      globalStateService.setView(ViewType.OTHER);
      globalStateService.clearUnitsAndProjects();

      // if string is not null
      if (ssoSignOut && this.doubtfireConstants.SignoutURL) {
        window.location.assign(this.doubtfireConstants.SignoutURL);
      } else {
        this.state.go('sign_in');
      }
    };

    if (this.userService.currentUser.authenticationToken) {
      this.httpClient.delete(this.AUTH_URL).subscribe({
        next: (_response) => doSignOut(),
        error: (_response) => doSignOut(),
      });
    } else {
      doSignOut();
    }
  }

  public timeoutAuthentication(): void {
    if (this.uiRouterGlobals.current.name !== 'timeout') {
      this.alertService.error('Authentication timed out', 6000);
      setTimeout(() => this.router.stateService.go('timeout'), 500);
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
