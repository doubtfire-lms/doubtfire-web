import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GroupSet, Unit} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class GroupSetService extends CachedEntityService<GroupSet> {
  protected readonly endpointFormat = 'units/:unit.id:/group_sets/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'name',
      'allowStudentsToCreateGroups',
      'allowStudentsToManageGroups',
      'keepGroupsInSameClass',
      'capacity',
      'locked',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(_json: object, other?: Unit): GroupSet {
    return new GroupSet(other);
  }
}
