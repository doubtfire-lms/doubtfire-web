import {CachedEntityService} from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiUrl';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TaskPrerequisite} from '../models/task-prerequisite';

@Injectable()
export class TaskPrerequisiteService extends CachedEntityService<TaskPrerequisite> {
  protected readonly endpointFormat =
    'units/:unitId:/task_definitions/:taskDefId:/prerequisites/:prerequisiteId:';

  protected readonly unitEndpointFormat = 'units/:unitId:/task_prerequisites';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'taskDefinitionId', 'prerequisiteId', 'taskStatus');

    // this.mapping.mapAllKeysToJsonExcept('id', 'taskDefinitionId', 'prerequisiteId', 'taskStatus');
    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public override createInstanceFrom(json: object, _other?: any): TaskPrerequisite {
    return new TaskPrerequisite(json);
  }

  public getUnitPrerequisites(unitId: number) {
    return this.fetchAll(
      {
        unitId: unitId,
      },
      {
        endpointFormat: this.unitEndpointFormat,
      },
    );
  }
}
