import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Campus} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class CampusService extends CachedEntityService<Campus> {
  protected readonly endpointFormat = 'campuses/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'name', 'mode', 'abbreviation', 'active', 'timezone');

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(_json: object): Campus {
    return new Campus();
  }
}
