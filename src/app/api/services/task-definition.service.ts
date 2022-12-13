

import { CachedEntityService } from 'ngx-entity-service';
import { TaskDefinition, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { MappingFunctions } from './mapping-fn';

@Injectable()
export class TaskDefinitionService extends CachedEntityService<TaskDefinition> {
  protected readonly endpointFormat = 'units/:unitId:/task_definitions/:id:';

  constructor(
    httpClient: HttpClient
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'abbreviation',
      'name',
      'description',
      'weighting',
      'targetGrade',
      {
        keys: 'targetDate',
        toEntityFn: MappingFunctions.mapDateToEndOfDay,
        toJsonFn: MappingFunctions.mapDayToJson
      },
      {
        keys: 'dueDate',
        toEntityFn: MappingFunctions.mapDateToEndOfDay,
        toJsonFn: MappingFunctions.mapDayToJson
      },
      {
        keys: 'startDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson
      },
      {
        keys: 'uploadRequirements',
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return JSON.stringify(taskDef.uploadRequirements);
        }
      },
      {
        keys: ['tutorialStream','tutorial_stream_abbr'],
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition, params?: any) => {
          return taskDef.unit.tutorialStreamsCache.get(data[key]);
        },
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return taskDef.tutorialStream?.abbreviation;
        }
      },
      {
        keys: 'plagiarismChecks',
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return JSON.stringify(taskDef.plagiarismChecks);
        }
      },
      'plagiarismReportUrl',
      'plagiarismWarnPct',
      'restrictStatusUpdates',
      {
        keys: ['groupSet','group_set_id'],
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition, params?: any) => {
          return taskDef.unit.groupSetsCache.get(data[key]);
        },
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return taskDef.groupSet?.id;
        }
      },
      'hasTaskSheet',
      'hasTaskResources',
      'hasTaskAssessmentResources',
      'isGraded',
      'maxQualityPts',
      'overseerImageId',
      'assessmentEnabled'
    );

    this.mapping.mapAllKeysToJsonExcept('id', 'plagiarismReportUrl', 'hasTaskSheet', 'hasTaskResources', 'hasTaskAssessmentResources');
  }

  public override createInstanceFrom(json: object, other?: any): TaskDefinition {
    return new TaskDefinition(other as Unit);
  }
}
