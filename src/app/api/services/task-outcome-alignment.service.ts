import { HttpClient } from '@angular/common/http';
import { CachedEntityService } from 'ngx-entity-service';
import { Project, TaskOutcomeAlignment, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';
import { UnitTutorialsListComponent } from 'src/app/units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component';

@Injectable()
export class TaskOutcomeAlignmentService extends CachedEntityService<TaskOutcomeAlignment> {
  protected readonly endpointFormat = 'teaching_periods/:teaching_period.id:/breaks/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'description',
      'rating',
      {
        keys: 'learningOutcomeId',
        toEntityOp: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const unit = entity.unit;
          entity.learningOutcome = unit.learningOutcomesCache.get(data[key]);
        },
      },
      {
        keys: 'taskDefinitionId',
        toEntityOp: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const unit = entity.unit;
          entity.taskDefinition = unit.taskDef(data[key]);
        }
      },
      {
        keys: 'taskId',
        toEntityOp: (data: object, key: string, entity: TaskOutcomeAlignment) => {
          const project = entity.project;
          entity.task = project.taskCache.get(data[key]);
        }
      }
    );

    this.mapping.addJsonKey('id', 'description', 'rating');
  }

  public override createInstanceFrom(json: any, other?: any): TaskOutcomeAlignment {
    return new TaskOutcomeAlignment(other as (Unit | Project));
  }
}
