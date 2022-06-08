import { Project, Task, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { CachedEntityService } from 'ngx-entity-service';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class TaskService extends CachedEntityService<Task> {
  protected readonly endpointFormat = '/projects/:project.id:/task_def_id/:taskDefinition.id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'projectId',
      {
        keys: 'taskDefinitionId',
        toEntityOp: (data: object, key: string, entity: Task, params?: any) => {
          const taskDef = entity.project.unit.taskDef(data['task_definition_id']);
          entity.definition = taskDef;
        }
      },
      'status',
      {
        keys: 'dueDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data['start_date']);
        }
      },
      'extensions',
      {
        keys: 'submissionDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data['start_date']);
        }
      },
      {
        keys: 'completionDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data['start_date']);
        }
      },
      'timesAssessed',
      'grade',
      'qualityPts',
      'includeInPortfolio',
      'pctSimilar',
      'similarToCount',
      'similarToDismissedCount',
      'numNewComments',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: object, other?: any): Task {
    return new Task(other as Project);
  }
}
