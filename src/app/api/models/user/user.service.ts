import { ResourceService } from '../resource.service';
import { HttpClient } from '@angular/common/http';
import { User } from './user';
import { UserSerializer } from './user.serializer';
import { Inject } from '@angular/core';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';

// Used to perform CRUD actions on User resources.
// Calls the ResourceService constructor, passing the URL path and serializer.
export class UserService extends ResourceService<User> {
  constructor(httpClient: HttpClient,
    @Inject(currentUser) private currentUser: any,
    @Inject(auth) private auth: any,
    @Inject(analyticsService) private analyticsService: any, ) {
    super(
      httpClient,
      'users',
      new UserSerializer());
  }

  // Specific to the User resrouce, so extended.
  save(user: User) {
    user.name = `${user.first_name} ${user.last_name}`;
    if (user === this.currentUser.profile) {
      this.auth.saveCurrentUser();
      if (user.opt_in_to_research) {
        this.analyticsService.event(
          'Doubtfire Analytics',
          'User opted in research'
        );
      }
    }
  }

}
