import { User } from './user';
import { CacheableEntityService } from '../cacheableentity.service';

export class UserService extends CacheableEntityService<User> {

  protected readonly endpointFormat = 'users/:id:';

  protected createInstanceFrom(json: any): User {
    let user = new User();
    user.updateFromJson(json);
    return user;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
