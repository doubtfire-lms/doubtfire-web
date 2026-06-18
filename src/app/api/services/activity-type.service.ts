import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ActivityType} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class ActivityTypeService extends CachedEntityService<ActivityType> {
  protected readonly endpointFormat = 'activity_types/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'name', 'abbreviation');

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(_json: object): ActivityType {
    return new ActivityType();
  }
}
