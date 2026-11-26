import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import {UnitRole, UnitService, User} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import API_URL from 'src/app/config/constants/apiUrl';

interface UnitMembershipResponse {
  kind: 'staff' | 'student';
  unit_id: number;
  unit_code: string;
  unit_name: string;
  teaching_period_name: string | null;
  active: boolean;
  role: string;
  project_id?: number;
}

export interface UserUnitMembership {
  kind: 'staff' | 'student';
  unitId: number;
  unitCode: string;
  unitName: string;
  teachingPeriodName: string | null;
  active: boolean;
  role: string;
  projectId?: number;
}

@Injectable()
export class UserService extends CachedEntityService<User> {
  protected readonly endpointFormat = 'users/:id:';
  private readonly tutorEndpointFormat = '/users/tutors';

  public readonly csvURL: string;

  constructor(private readonly unitMembershipHttpClient: HttpClient) {
    super(unitMembershipHttpClient, API_URL);

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
      'observeAllUnits',
      'receiveTaskNotifications',
      'receivePortfolioNotifications',
      'receiveFeedbackNotifications',
      'hasRunFirstTimeSetup',
      'pronouns',
      'acceptedTiiEula',
      'timezone',
      'autoTimezone',
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

  public getUnitMemberships(userId: number): Observable<UserUnitMembership[]> {
    return this.unitMembershipHttpClient
      .get<UnitMembershipResponse[]>(`${API_URL}/users/${userId}/unit_memberships`)
      .pipe(
        map((memberships) =>
          memberships.map((membership) => ({
            kind: membership.kind,
            unitId: membership.unit_id,
            unitCode: membership.unit_code,
            unitName: membership.unit_name,
            teachingPeriodName: membership.teaching_period_name,
            active: membership.active,
            role: membership.role,
            projectId: membership.project_id,
          })),
        ),
      );
  }

  public adminRoleFor(unitId: number, user: User): UnitRole {
    return this.adminOrAuditorRoleFor('Admin', unitId, user);
  }

  public adminOrAuditorRoleFor(
    role: 'Admin' | 'Auditor' | 'Convenor',
    unitId: number,
    user: User,
  ): UnitRole {
    const result = new UnitRole();
    result.role = role;
    result.user = user;
    result.observerOnly = role === 'Convenor';

    const unitService = AppInjector.get(UnitService);
    result.unit = unitService.cache.getOrCreate(unitId, unitService, {id: unitId});

    return result;
  }
}
