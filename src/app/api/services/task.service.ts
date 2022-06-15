import { Project, Task, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { CachedEntityService } from 'ngx-entity-service';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { MappingFunctions } from './mapping-fn';

@Injectable()
export class TaskService extends CachedEntityService<Task> {
  protected readonly endpointFormat = '/projects/:projectId:/task_def_id/:taskDefId:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'projectId',
      {
        keys: 'taskDefinitionId',
        toEntityOp: (data: object, key: string, entity: Task, params?: any) => {
          entity.definition = entity.project.unit.taskDef(data['task_definition_id']);
        }
      },
      'status',
      {
        keys: 'dueDate',
        toEntityFn: MappingFunctions.mapDateToEndOfDay
      },
      'extensions',
      {
        keys: 'submissionDate',
        toEntityFn: MappingFunctions.mapDateToDay
      },
      {
        keys: 'completionDate',
        toEntityFn: MappingFunctions.mapDateToDay
      },
      'timesAssessed',
      'grade',
      'qualityPts',
      'includeInPortfolio',
      'pctSimilar',
      'similarToCount',
      'similarToDismissedCount',
      'numNewComments',
      'trigger',
      {
        keys: "new_stat",
        toEntityOp: (data: object, key: string, entity: Task, params?: any) => {
          entity.project.taskStats = data['new_stat'];
        }
      },
      {
        keys: 'otherProjects',
        toEntityOp: (data: object, key: string, entity: Task, params?: any) => {
          data['other_projects'].foreEach((details) => {
            const proj = entity.unit.findStudent(details.id)
            if (proj) {
              // Update the other project's task status overview
              const otherTask = proj.findTaskForDefinition(entity.definition.id)
              if (otherTask) {
                otherTask.project.taskStats = details['new_stats'];
                otherTask.grade = data['grade'];
                otherTask.status = data['status'];
              }
            }
          });
        }
      }
    );

    this.mapping.addJsonKey(
      'qualityPts',
      'grade',
      'includeInPortfolio',
      'trigger'
    );
  }

  public createInstanceFrom(json: object, other?: any): Task {
    return new Task(other as Project);
  }


}
