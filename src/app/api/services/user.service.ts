import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UnitRole, UnitService, User} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class UserService extends CachedEntityService<User> {
  protected readonly endpointFormat = 'users/:id:';
  private readonly tutorEndpointFormat = '/users/tutors';

  public readonly csvURL: string;

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.csvURL = API_URL + '/csv/users';

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
      'pronouns',
      'acceptedTiiEula',
    );

    this._currentUser = this.anonymousUser;

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  public createInstanceFrom(json: object, other?: any): User {
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

  public getTutors(): Observable<User[]> {
    return this.query(undefined, {endpointFormat: this.tutorEndpointFormat});
  }

  public adminRoleFor(unitId: number, user: User): UnitRole {
    return this.adminOrAuditorRoleFor('Admin', unitId, user);
  }

  public adminOrAuditorRoleFor(role: 'Admin' | 'Auditor', unitId: number, user: User): UnitRole {
    const result = new UnitRole();
    result.role = role;
    result.user = user;

    const unitService = AppInjector.get(UnitService);
    result.unit = unitService.cache.getOrCreate(unitId, unitService, {id: unitId});

    return result;
  }
}
