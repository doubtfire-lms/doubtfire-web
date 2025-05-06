import { CachedEntityService } from 'ngx-entity-service';
import { TaskDefinition, Unit } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { MappingFunctions } from './mapping-fn';
import { AppInjector } from 'src/app/app-injector';
import { Observable } from 'rxjs';

@Injectable()
export class TaskDefinitionService extends CachedEntityService<TaskDefinition> {
  protected readonly endpointFormat = 'units/:unitId:/task_definitions/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'abbreviation',
      'name',
      'description',
      'weighting',
      'targetGrade',
      'mossLanguage',
      {
        keys: 'targetDate',
        toEntityFn: MappingFunctions.mapDateToEndOfDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'dueDate',
        toEntityFn: MappingFunctions.mapDateToEndOfDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'startDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'uploadRequirements',
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return JSON.stringify(
            taskDef.uploadRequirements?.map((upreq) => {
              return {
                key: upreq.key,
                name: upreq.name,
                type: upreq.type,
                tii_check: upreq.tiiCheck,
                tii_pct: upreq.tiiPct,
              };
            }),
          );
        },
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition, params?: any) => {
          return (
            data[key] as Array<{
              key: string;
              name: string;
              type: string;
              tii_check: boolean;
              tii_pct: number;
            }>
          )?.map((upreq) => {
            return {
              key: upreq.key,
              name: upreq.name,
              type: upreq.type,
              tiiCheck: upreq.tii_check,
              tiiPct: upreq.tii_pct,
            };
          });
        },
      },
      {
        keys: ['tutorialStream', 'tutorial_stream_abbr'],
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition, params?: any) => {
          return taskDef.unit.tutorialStreamsCache.get(data[key]);
        },
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return taskDef.tutorialStream?.abbreviation;
        },
      },
      'plagiarismWarnPct',
      'restrictStatusUpdates',
      {
        keys: ['groupSet', 'group_set_id'],
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition, params?: any) => {
          if (data[key]) {
            return taskDef.unit.groupSetsCache.get(data[key]);
          } else {
            return data[key];
          }
        },
        toJsonFn: (taskDef: TaskDefinition, key: string) => {
          return taskDef.groupSet?.id;
        },
      },
      'hasTaskSheet',
      'hasTaskResources',
      'hasTaskAssessmentResources',
      'scormEnabled',
      'hasScormData',
      'scormAllowReview',
      'scormBypassTest',
      'scormTimeDelayEnabled',
      'scormAttemptLimit',
      'isGraded',
      'maxQualityPts',
      'overseerImageId',
      'assessmentEnabled'
    );

    this.mapping.mapAllKeysToJsonExcept(
      'id',
      'hasTaskSheet',
      'hasTaskResources',
      'hasTaskAssessmentResources',
      'hasScormData'
    );
  }

  public override createInstanceFrom(json: object, other?: any): TaskDefinition {
    return new TaskDefinition(other as Unit);
  }

  public uploadTaskSheet(taskDefinition: TaskDefinition, file: File): Observable<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    return AppInjector.get(HttpClient).post<boolean>(taskDefinition.taskSheetUploadUrl, formData);
  }

  public uploadTaskResources(taskDefinition: TaskDefinition, file: File): Observable<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    return AppInjector.get(HttpClient).post<boolean>(taskDefinition.taskResourcesUploadUrl, formData);
  }

  public uploadOverseerResources(taskDefinition: TaskDefinition, file: File): Observable<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    return AppInjector.get(HttpClient).post<boolean>(taskDefinition.taskAssessmentResourcesUploadUrl, formData);
  }

  public uploadScormData(taskDefinition: TaskDefinition, file: File): Observable<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    return AppInjector.get(HttpClient).post<boolean>(taskDefinition.scormDataUploadUrl, formData);
  }
}
