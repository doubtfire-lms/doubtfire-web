import { CachedEntityService } from 'ngx-entity-service';
import { Group, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class GroupService extends CachedEntityService<Group> {
  protected readonly endpointFormat = 'unit/:unit.id:/group_sets/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'name',
      {
        keys: ['groupSet','group_set_id'],
        toEntityFn: (data: object, jsonKey: string, grp: Group) => {
          return grp.unit.groupSetsCache.get(data[jsonKey]);
        }
      },
      'allowStudentsToManageGroups',
      'keepGroupsInSameClass',
      'capacity',
      'locked',
    );

    this.mapping.mapAllKeysToJsonExcept('id', 'groupSet');
  }

  public createInstanceFrom(json: object, other?: any): Group {
    return new Group(other as Unit);
  }
}
