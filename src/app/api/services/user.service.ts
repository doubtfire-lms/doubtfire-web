import { User } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService } from 'ngx-entity-service';
import { Inject, Injectable } from '@angular/core';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class UserService extends CachedEntityService<User> {
  entityName: string = 'User';
  protected readonly endpointFormat = 'users/:id:';

  constructor(
    httpClient: HttpClient,
    @Inject(currentUser) private CurrentUser: any,
    @Inject(auth) private Auth: any,
    @Inject(analyticsService) private AnalyticsService: any
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'name',
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
    );
  }

  public createInstanceFrom(json: any, other?: any): User {
    return new User();
  }

  // Specific to the User entity
  public save(user: User) {
    user.name = `${user.firstName} ${user.lastName}`;
    if (user === this.CurrentUser.profile) {
      this.Auth.saveCurrentUser();
      if (user.optInToResearch) {
        this.AnalyticsService.event('Doubtfire Analytics', 'User saved');
      }
    }
  }
}
