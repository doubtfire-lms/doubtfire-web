import { Campus } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { CachedEntityService } from 'ngx-entity-service';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class CampusService extends CachedEntityService<Campus> {
  protected readonly endpointFormat = 'campuses/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'name',
      'mode',
      'abbreviation',
      'active'
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: object, other?: any): Campus {
    return new Campus();
  }
}
