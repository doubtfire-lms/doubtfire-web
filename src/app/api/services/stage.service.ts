import { Stage } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { CachedEntityService } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class StageService extends CachedEntityService<Stage> {
  protected readonly endpointFormat = 'stages/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'title',
      'order',
      {
        keys: ['taskDefinition', 'task_definition_id'],
        toJsonFn: (entity: Stage, key: string) => entity.taskDefinition.id,
      }
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: object, other?: any): Stage {
    // other will be the task definition
    return new Stage(other);
  }
}
