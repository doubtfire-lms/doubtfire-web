

import { CachedEntityService } from 'ngx-entity-service';
import { TaskDefinition, TutorialStreamService, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class TaskDefinitionService extends CachedEntityService<TaskDefinition> {
  protected readonly endpointFormat = 'units/:unit.id:/task_definitions/:id:';

  constructor(
    httpClient: HttpClient,
    private tutorialStreamService: TutorialStreamService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'abbreviation',
      'name',
      'description',
      'weighting',
      'targetGrade',
      'targetDate',
      'dueDate',
      'startDate',
      'uploadRequirements',
      {
        keys: ['tutorialStream','tutorial_stream_abbr'],
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition, params?: any) => {
          return taskDef.unit.tutorialStreams.get(data['tutorial_stream_abbr']);
        },
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return taskDef.tutorialStream?.abbreviation;
        }
      },
      'plagiarismChecks',
      'plagiarismReportUrl',
      'plagiarismWarnPct',
      'restrictStatusUpdates',
      'groupSetId',
      'hasTaskSheet',
      'hasTaskResources',
      'hasTaskAssessmentResources',
      'isGraded',
      'maxQualityPts',
      'overseerImageId',
      'assessmentEnabled',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: object, other?: any): TaskDefinition {
    return new TaskDefinition(other as Unit);
  }
}
