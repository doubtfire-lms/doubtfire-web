import { HttpClient } from '@angular/common/http';
import { CachedEntityService } from 'ngx-entity-service';
import { Project, TaskOutcomeAlignment, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';
import { UnitTutorialsListComponent } from 'src/app/units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';

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
        toJsonFn: (entity: TaskOutcomeAlignment, key: string) => {
          return entity.learningOutcome.id;
        }
      },
      {
        keys: ['taskDefinition', 'task_definition_id'],
        toEntityFn: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const unit = entity.unit;
          return unit.taskDef(data[key]);
        },
        toJsonFn: (entity: TaskOutcomeAlignment, key: string) => {
          return entity.taskDefinition.id;
        }
      },
      {
        keys: ['task', 'task_id'],
        toEntityFn: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const project = entity.project;
          return project.taskCache.get(data[key]);
        },
        toJsonFn: (entity: TaskOutcomeAlignment, key: string) => {
          return entity.task?.id;
        }
      }
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public override createInstanceFrom(json: any, other?: any): TaskOutcomeAlignment {
    return new TaskOutcomeAlignment(other as (Unit | Project));
  }
}
