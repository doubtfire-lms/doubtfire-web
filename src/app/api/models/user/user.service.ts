import { User } from './user';
import { CacheableEntityService } from '../cacheable-entity.service';
import { Inject, Injectable } from '@angular/core';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService extends CacheableEntityService<User> {
  entityName: string = 'User';
  protected readonly endpointFormat = 'users/:id:';

  constructor(
    httpClient: HttpClient,
    @Inject(currentUser) private CurrentUser: any,
    @Inject(auth) private Auth: any,
    @Inject(analyticsService) private AnalyticsService: any
  ) {
    super(httpClient);
  }

  protected createInstanceFrom(json: any, other?: any): User {
    const user = new User();
    user.updateFromJson(json);
    return user;
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  // Specific to the User entity
  public save(user: User) {
    user.name = `${user.first_name} ${user.last_name}`;
    if (user === this.CurrentUser.profile) {
      this.Auth.saveCurrentUser();
      if (user.opt_in_to_research) {
        this.AnalyticsService.event('Doubtfire Analytics', 'User saved');
      }
    }
  }
}
