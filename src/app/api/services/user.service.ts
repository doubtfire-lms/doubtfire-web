import { UnitRole, UnitService, User } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService, RequestOptions } from 'ngx-entity-service';
import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { AppInjector } from 'src/app/app-injector';
import { AuthenticationService } from './authentication.service';
import { Observable, tap } from 'rxjs';

@Injectable()
export class UserService extends CachedEntityService<User> {
  protected readonly endpointFormat = 'users/:id:';
  private readonly tutorEndpointFormat = '/users/tutors';

  public readonly csvURL: string;

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.csvURL = API_URL + 'csv/users';

    this.mapping.addKeys(
      'id',
      'firstName',
      'lastName',
      'optInToResearch',
      'studentId',
      'email',
      'username',
      'nickname',
      'systemRole',
      'receiveTaskNotifications',
      'receivePortfolioNotifications',
      'receiveFeedbackNotifications',
      'hasRunFirstTimeSetup',
      'pronouns'
    );

    this._currentUser = this.anonymousUser;

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: any, other?: any): User {
    return new User();
  }

  public newEmptyUser(): User {
    return new User();
  }

  public get anonymousUser(): User {
    const result = new User();
    result.firstName = 'Anonymous';
    result.lastName = 'User';
    result.nickname = 'anon';
    return result;
  }

  public isAnonymousUser(): boolean {
    return this.currentUser.id === this.anonymousUser.id;
  }

  private _currentUser: User;
  public get currentUser(): User {
    return this._currentUser;
  }

  public set currentUser(user: User) {
    this._currentUser = user;
  }

  // Specific to the User entity
  public override update(pathIds: object | User, options?: RequestOptions<User>): Observable<User> {
    return super.update(pathIds, options).pipe(
      tap((user) => {
        if (user === this.currentUser) {
          AppInjector.get(AuthenticationService).saveCurrentUser();
        }
      })
    );
  }

  public getTutors(): Observable<User[]> {
    return this.query(undefined, { endpointFormat: this.tutorEndpointFormat });
  }

  public adminRoleFor(unitId: number, user: User): UnitRole {
    const result = new UnitRole();
    result.role = 'Admin';
    result.user = user;

    const unitService = AppInjector.get(UnitService);
    result.unit = unitService.cache.getOrCreate(unitId, unitService, { id: unitId });

    return result;
  }
}
