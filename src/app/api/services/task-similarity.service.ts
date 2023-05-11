import { Task, TaskSimilarity } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { CachedEntityService } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TaskSimilarityService extends CachedEntityService<TaskSimilarity> {
  protected readonly endpointFormat = 'tasks/:taskId:/similarities/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'type', 'flagged', 'pct', 'parts');

    this.mapping.addJsonKey('flagged');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override createInstanceFrom(_json: object, constructorParams: Task): TaskSimilarity {
    return new TaskSimilarity(constructorParams);
  }
}
