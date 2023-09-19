import { User, UserService } from 'src/app/api/models/doubtfire-model';
import { Inject, Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { StateService, UIRouter, UIRouterGlobals } from '@uirouter/angular';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { AppInjector } from 'src/app/app-injector';
import { map, Observable, tap, catchError, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthenticationService implements OnInit {
  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    @Inject(alertService) private alertService: any,
    private state: StateService,
    private doubtfireConstants: DoubtfireConstants,
    private router: UIRouter,
    private uiRouterGlobals: UIRouterGlobals
  ) {}

  ngOnInit() {
    this.checkUserCookie();
    this.updateAuth();
  }

  public checkUserCookie(): void {
    const userData = JSON.parse(localStorage.getItem(this.USERNAME_KEY));
    const user = new User();
    Object.assign(user, userData);

    if (userData && this.tryChangeUser(user)) {
      // Ensure current user is in cache
      this.userService.cache.add(user);
      this.userService.currentUser = user;

      const resetTime = new Date(Number.parseInt(localStorage.getItem(this.DOUBTFIRE_LOGIN_TIME)) + 60 * 60 * 1000);
      const waitTime = resetTime.valueOf() - new Date().valueOf();

      setTimeout(() => this.updateAuth(), waitTime);
    }
  }

  private readonly AUTH_URL: string = `${environment.API_URL}/auth`;
  public readonly USERNAME_KEY: string = 'doubtfire_user';
  public readonly REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN: string = 'remember_doubtfire_credentials_token';
  public readonly DOUBTFIRE_LOGIN_TIME: string = 'doubtfire_login_time';

  public saveCurrentUser(
    remember: boolean = localStorage.getItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) === 'true'
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

  private async updateAuth() {
    if (!this.isAuthenticated()) {
      return;
    }

    const remember: boolean = localStorage.getItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) === 'true';
    localStorage.setItem(this.DOUBTFIRE_LOGIN_TIME, JSON.stringify(new Date().getTime()));

    try {
      const response = await this.httpClient
        .put(this.AUTH_URL, {
          username: this.userService.currentUser.username,
          remember: remember,
        })
        .pipe(
          tap((response) => {
            this.userService.currentUser.authenticationToken = response['auth_token'];
            this.saveCurrentUser(remember);
          }),
          catchError((error) => {
            // Handle error here
            throw error;
          })
        )
        .toPromise();

      // Update auth each hour
      setTimeout(() => this.updateAuth(), 1000 * 60 * 60);
    } catch (error) {
      // Handle error here
    }
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

  private readonly validRoles: string[] = ['anon', 'Student', 'Tutor', 'Convenor', 'Admin'];

  private isValidRoleWhitelist(roleWhitelist: string[]): boolean {
    return roleWhitelist.every((role: string) => this.validRoles.includes(role));
  }

  public isAuthorised(roleWhitelist: string[], role?: string): boolean {
    if (!role) {
      role = this.userService.currentUser.role;
    }

    return roleWhitelist.length > 0 && this.isValidRoleWhitelist(roleWhitelist) && roleWhitelist.includes(role);
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
        }
  ): Observable<any> {
    const { username, remember } = userCredentials; // Destructuring assignment
    return this.httpClient.post(this.AUTH_URL, userCredentials).pipe(
      map((response: any) => {
        // Extract relevant data from response and construct user object to store in cache.
        const user: User = this.userService.cache.getOrCreate(
          response['user']['id'],
          this.userService,
          response['user']
        );

        user.authenticationToken = response['auth_token'];

        if (this.tryChangeUser(user, remember)) {
          AppInjector.get(GlobalStateService).loadGlobals();
        } else {
          return new Error('Failed to change user');
        }

        // Update token in one hour
        setTimeout(() => this.updateAuth(), 1000 * 60 * 60);
      })
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
        next: (response) => doSignOut(),
      });
    } else {
      doSignOut();
    }
  }

  public timeoutAuthentication(): void {
    if (this.uiRouterGlobals.current.name !== 'timeout') {
      this.alertService.add('danger', `Authentication timed out`, 6000); // Template literal
      setTimeout(() => this.router.stateService.go('timeout'), 500);
    }
  }

  public async login(username: string, password: string, remember: boolean): Promise<User> {
    try {
      const response = await this.httpClient
        .post(this.AUTH_URL, {
          username: username,
          password: password,
          remember: remember,
        })
        .pipe(
          switchMap((response) => {
            return this.userService.get(response['user_id']);
          }),
          tap((user) => {
            this.tryChangeUser(user, remember);
          }),
          catchError((error) => {
            // Handle error here
            throw error;
          })
        )
        .toPromise();

      return response as User;
    } catch (error) {
      // Handle error here
    }
  }

  public async logout(): Promise<void> {
    try {
      const response = await this.httpClient.delete(this.AUTH_URL).toPromise();
      this.tryChangeUser(new User());
    } catch (error) {
      // Handle error here
    }
  }

  public async checkRole(roleWhitelist: string[]): Promise<boolean> {
    if (!this.isValidRoleWhitelist(roleWhitelist)) {
      throw new Error('Invalid role whitelist');
    }

    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await this.httpClient
        .get(`${this.AUTH_URL}/roles`, { params: { roles: roleWhitelist.join(',') } })
        .toPromise();

      return response['has_role'];
    } catch (error) {
      // Handle error here
    }
  }
}
