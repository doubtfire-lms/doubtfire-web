import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Project, TaskOutcomeAlignment, Unit} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class TaskOutcomeAlignmentService extends CachedEntityService<TaskOutcomeAlignment> {
  protected readonly endpointFormat = 'units/:unit.id:/learning_alignments/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'description',
      'rating',
      {
        keys: ['learningOutcome', 'learning_outcome_id'],
        toEntityFn: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const unit = entity.unit;
          return unit.learningOutcomesCache.get(data[key]);
        },
        toJsonFn: (entity: TaskOutcomeAlignment, _key: string) => {
          return entity.learningOutcome.id;
        },
      },
      {
        keys: ['taskDefinition', 'task_definition_id'],
        toEntityFn: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const unit = entity.unit;
          return unit.taskDef(data[key]);
        },
        toJsonFn: (entity: TaskOutcomeAlignment, _key: string) => {
          return entity.taskDefinition.id;
        },
      },
      {
        keys: ['task', 'task_id'],
        toEntityFn: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const project = entity.project;
          return project.taskCache.get(data[key]);
        },
        toJsonFn: (entity: TaskOutcomeAlignment, _key: string) => {
          return entity.task?.id;
        },
      },
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public override createInstanceFrom(_json: object, other?: Unit | Project): TaskOutcomeAlignment {
    return new TaskOutcomeAlignment(other);
  }
}
