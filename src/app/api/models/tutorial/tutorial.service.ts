import { ResourceService } from '../resource.service';
import { HttpClient } from '@angular/common/http';
import { Tutorial } from './tutorial';
import { TutorialSerializer } from './tutorial.serializer';

// Used to perform CRUD actions on User resources.
// Calls the ResourceService constructor, passing the URL path and serializer.
export class TutorialService extends ResourceService<Tutorial> {
  constructor(httpClient: HttpClient ) {
    super(
      httpClient,
      'tutorials',
      new TutorialSerializer());
  }
}
