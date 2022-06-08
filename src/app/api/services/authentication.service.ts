import { User, UserService } from 'src/app/api/models/doubtfire-model';
import { Inject, Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { UIRouter, UIRouterGlobals } from '@uirouter/angular';

@Injectable()
export class AuthenticationService {

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    doubtfireConstants: DoubtfireConstants,
    private router: UIRouter,
    private uiRouterGlobals: UIRouterGlobals
  ) {
    this.AUTH_URL = `${doubtfireConstants.API_URL}/auth`
  }

  public checkUserCookie(): void {
    const userData = JSON.parse(localStorage.getItem(this.USERNAME_KEY));
    const user = new User();
    Object.assign(user, userData);

    if (userData && this.tryChangeUser(user)) {
      // Ensure current user is in cache
      this.userService.cache.set(`${user.id}`, user);
      this.userService.currentUser = user;
    }
  }

  private readonly AUTH_URL: string;
  public readonly USERNAME_KEY: string = 'doubtfire_user';
  public readonly REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN: string = 'remember_doubtfire_credentials_token';
  public readonly DOUBTFIRE_LOGIN_TIME: string = 'doubtfire_login_time';

  public saveCurrentUser(remember: boolean = localStorage.getItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) === 'true') {
    if (remember && this.userService.currentUser.id) {
      localStorage.setItem(this.USERNAME_KEY, JSON.stringify(this.userService.currentUser));
      localStorage.setItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN, "true");
      localStorage.setItem(this.DOUBTFIRE_LOGIN_TIME, JSON.stringify(new Date().getTime()));
    } else {
      localStorage.removeItem(this.USERNAME_KEY);
      localStorage.setItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN, "false");
      localStorage.removeItem(this.DOUBTFIRE_LOGIN_TIME);
    }
  }

  public isAuthenticated() {
    return this.userService.currentUser.id !== undefined;
  }

  private updateAuth() {
    if (! this.isAuthenticated()) {
      return;
    }

    const remember: boolean = localStorage.getItem(this.REMEMBER_DOUBTFIRE_CREDENTIALS_TOKEN) === 'true';
    localStorage.set(this.DOUBTFIRE_LOGIN_TIME, new Date().getTime());

    this.httpClient.put(this.AUTH_URL,
      {
        username: this.userService.currentUser.username,
        remember: remember
      }
    ).subscribe(
      {
        next: (response) => {
          this.userService.currentUser.authenticationToken = response['auth_token'];
          this.saveCurrentUser(remember);

          // Update auth each hour
          setTimeout( () => this.updateAuth(), 1000*60*60);
        }
      }
    );
  }

  private tryChangeUser(user: User, remember?: boolean) {
    if (user) {
      // Clear the current user object and populate it with the new values.
      // Note how the actual user object reference doesn't change.
      // delete currentUser[prop] for prop of currentUser
      // _.extend currentUser, user
      this.userService.currentUser = user
      this.saveCurrentUser(remember);

      return true;
    } else {
      return false
    }
  }

  private readonly validRoles: string[] = [
    "anon",
    "Student",
    "Tutor",
    "Convenor",
    "Admin"
  ];

  private isValidRoleWhitelist(roleWhitelist: string[]) {
    return roleWhitelist.filter( (role: string) => this.validRoles.includes(role)).length !== 0;
  }

  public isAuthorised(roleWhitelist: string[], role?: string) {
    if (!role) {
      role = this.userService.currentUser.role;
    }

    return roleWhitelist.length > 0 && (this.isValidRoleWhitelist(roleWhitelist) && roleWhitelist.includes(role));
  }

  public signIn(
    username: string,
    password: string,
    remember: boolean,
    success: () => void,
    error: () => void
  ) {
    this.httpClient.post(
      this.AUTH_URL,
      {
        username: username,
        password: password,
        remember: remember
      }
    ).subscribe(
      {
        next: (response) => {
          // Extract relevant data from response and construct user object to store in cache.
          const user: User = this.userService.cache.getOrCreate(
            response['user']['id'],
            this.userService,
            response['user']
          );

          user.authenticationToken = response['auth_token'];

          if(this.tryChangeUser(user, remember)) {
            success();
          } else {
            error();
          }

          // Update token in one hour
          setTimeout( () => this.updateAuth(), 1000*60*60);
        }
      }
    );
  }

  public signOut() {
    const doSignOut = () => {
      this.tryChangeUser(this.userService.anonymousUser, false);
    }

    if(this.userService.currentUser.authenticationToken) {
      this.httpClient.delete(this.AUTH_URL).subscribe(
        {
          next: (response) => doSignOut()
        }
      );
    } else {
      doSignOut();
    }
  }

  public timeoutAuthentication() {
    if (this.uiRouterGlobals.current.name !== "timeout") {
      this.router.stateService.go("timeout");
    }
  }

}
