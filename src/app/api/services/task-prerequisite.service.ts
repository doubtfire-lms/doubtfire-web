import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CachedEntityService} from 'ngx-entity-service';
import {TaskDefinition} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiURL';
import {TaskPrerequisite} from '../models/task-prerequisite';

@Injectable()
export class TaskPrerequisiteService extends CachedEntityService<TaskPrerequisite> {
  protected readonly endpointFormat = 'units/:unitId:/task_definitions/:id:/prerequisites';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    console.log('making new prerequisite');

    this.mapping.addKeys('id', 'taskDefinitionId', 'prerequisiteId', 'taskStatus');

    // this.mapping.mapAllKeysToJsonExcept('id', 'taskDefinitionId', 'prerequisiteId', 'taskStatus');
  }

  public override createInstanceFrom(json: object, other?: any): TaskPrerequisite {
    return new TaskPrerequisite();
  }

  public mapTaskPrerequisites(
    prerequisites: readonly TaskPrerequisite[],
    definitions: readonly TaskDefinition[],
  ): void {
    for (const prerequisite of prerequisites) {
      prerequisite.taskDefinition = definitions.find(
        (td) => td.id === prerequisite.taskDefinitionId,
      );
      prerequisite.prerequisite = definitions.find((td) => td.id === prerequisite.prerequisiteId);
    }
  }
}
