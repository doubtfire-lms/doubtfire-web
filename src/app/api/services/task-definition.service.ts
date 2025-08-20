import {CachedEntityService} from 'ngx-entity-service';
import {LearningOutcomeService, TaskDefinition, Unit} from 'src/app/api/models/doubtfire-model';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import {MappingFunctions} from './mapping-fn';
import {AppInjector} from 'src/app/app-injector';
import {Observable} from 'rxjs';
import {MappingProcess} from 'ngx-entity-service/lib/mapping-process';

@Injectable()
export class TaskDefinitionService extends CachedEntityService<TaskDefinition> {
  protected readonly endpointFormat = 'units/:unitId:/task_definitions/:id:';

  constructor(
    httpClient: HttpClient,
    private learningOutcomeService: LearningOutcomeService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'abbreviation',
      'name',
      'description',
      'weighting',
      'targetGrade',
      'similarityLanguage',
      'hasJplagReport',
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
      'assessmentEnabled',
      {
        keys: 'ilos',
        toEntityOp: (data: object, key: string, taskDefinition: TaskDefinition) => {
          data[key]?.forEach((ilo) => {
            taskDefinition.learningOutcomesCache.getOrCreate(
              ilo['id'],
              this.learningOutcomeService,
              ilo,
            );
          });
        },
      },
      {
        keys: ['prerequisites', 'task_prerequisites'],
        toEntityOpAsync: (process: MappingProcess<TaskDefinition>) => {
          // HACK: Wait for all the other task definitions to be processed before we map the pre-requisites
          setTimeout(() => {
            const idColumnKey = 'prerequisite_id';
            const prereqs = process.data['task_prerequisites'];
            const td = process.entity;
            const taskDefinitions = process.entity.unit.taskDefinitionCache.currentValues;

            // remove any prerequisites that have been deleted
            td.taskPrerequisitesCache.currentValues
              .filter((p) => !prereqs.some((pr) => pr[idColumnKey] === p.id))
              .forEach((p) => td.taskPrerequisitesCache.delete(p.id));

            // add/update prerequisites
            for (const prereq of prereqs) {
              td.taskPrerequisitesCache.getOrCreate(
                prereq[idColumnKey],
                this,
                taskDefinitions.find((t) => t.id === prereq[idColumnKey]),
              );
            }
          });
        },
      },
    );

    this.mapping.mapAllKeysToJsonExcept(
      'id',
      'hasTaskSheet',
      'hasTaskResources',
      'hasTaskAssessmentResources',
      'hasScormData',
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
    return AppInjector.get(HttpClient).post<boolean>(
      taskDefinition.taskResourcesUploadUrl,
      formData,
    );
  }

  public uploadOverseerResources(taskDefinition: TaskDefinition, file: File): Observable<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    return AppInjector.get(HttpClient).post<boolean>(
      taskDefinition.taskOverseerResourcesUploadUrl,
      formData,
    );
  }

  public uploadScormData(taskDefinition: TaskDefinition, file: File): Observable<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    return AppInjector.get(HttpClient).post<boolean>(taskDefinition.scormDataUploadUrl, formData);
  }

  public addTaskPrerequisite(
    taskDefinition: TaskDefinition,
    prerequsite: TaskDefinition,
  ): Observable<boolean> {
    return AppInjector.get(HttpClient).post<boolean>(taskDefinition.taskPrerequisiteUrl, {
      prerequisite_id: prerequsite.id,
    });
  }

  public removeTaskPrerequisite(
    taskDefinition: TaskDefinition,
    prerequsite: TaskDefinition,
  ): Observable<boolean> {
    return AppInjector.get(HttpClient).delete<boolean>(
      `${taskDefinition.taskPrerequisiteUrl}/${prerequsite.id}`,
    );
  }
}
