import { ActivityType } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { CachedEntityService } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ActivityTypeService extends CachedEntityService<ActivityType> {
  protected readonly endpointFormat = 'activity_types/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'name',
      'abbreviation',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: object, other?: any): ActivityType {
    return new ActivityType();
  }
}
