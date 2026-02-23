import {CachedEntityService} from 'ngx-entity-service';
import {
  LearningOutcomeService,
  TaskDefinition,
  TaskStatusEnum,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiUrl';
import {MappingFunctions} from './mapping-fn';
import {AppInjector} from 'src/app/app-injector';
import {Observable} from 'rxjs';
import {TaskPrerequisiteService} from './task-prerequisite.service';
import {TaskPrerequisite} from '../models/task-prerequisite';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SidekiqJob} from '../models/sidekiq-job';
import {OverseerStepService} from './overseer-step.service';

@Injectable()
export class TaskDefinitionService extends CachedEntityService<TaskDefinition> {
  protected readonly endpointFormat = 'units/:unitId:/task_definitions/:id:';

  constructor(
    httpClient: HttpClient,
    private learningOutcomeService: LearningOutcomeService,
    private taskPrerequisiteService: TaskPrerequisiteService,
    private overseerStepService: OverseerStepService,
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
      'assessInPortfolioOnly',
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
      'hasTaskAssessmentScript',
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
      'discussionPromptsCount',
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
      'useResourcesForJplagBaseCode',
      'lockAssessmentsToTutorialStream',
      {
        keys: 'overseerSteps',
        toEntityOp: (data: object, key: string, taskDefinition: TaskDefinition) => {
          data[key]?.forEach((overseerStep) => {
            taskDefinition.overseerStepsCache.getOrCreate(
              overseerStep['id'],
              this.overseerStepService,
              overseerStep,
              {
                constructorParams: taskDefinition,
              },
            );
          });
        },
      },
      'overseerResourceFiles',
      // {
      //   keys: 'pTargetDate',
      //   toEntityFn: MappingFunctions.mapDateToDay,
      //   toJsonFn: MappingFunctions.mapDayToJson,
      // },
      {
        keys: 'cTargetDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'dTargetDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'hdTargetDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },

      {
        keys: 'cStartDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'dStartDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'hdStartDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
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

  public uploadOverseerResources(taskDefinition: TaskDefinition, file: File): Observable<string[]> {
    const formData = new FormData();
    formData.append('file', file);
    return AppInjector.get(HttpClient).post<string[]>(
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
  ): Observable<TaskPrerequisite> {
    return AppInjector.get(HttpClient).post<TaskPrerequisite>(taskDefinition.taskPrerequisiteUrl, {
      task_def_id: taskDefinition.id,
      prerequisite_id: prerequsite.id,
    });
  }

  public updateTaskPrerequisite(
    taskPrerequisiteLink: TaskPrerequisite,
    taskStatus: TaskStatusEnum,
  ): Observable<boolean> {
    return AppInjector.get(HttpClient).put<boolean>(
      `${taskPrerequisiteLink.taskDefinition.taskPrerequisiteUrl}/${taskPrerequisiteLink.id}`,
      {
        task_status_required: taskStatus,
      },
    );
  }

  public zipSubmissionFiles(taskDefinition: TaskDefinition): Observable<SidekiqJob> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/submission/units/${taskDefinition.unit.id}/task_definitions/${taskDefinition.id}/download_submissions/zip`;
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.get<SidekiqJob>(url);
  }

  public zipSubmissionPdfs(taskDefinition: TaskDefinition): Observable<SidekiqJob> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/submission/units/${taskDefinition.unit.id}/task_definitions/${taskDefinition.id}/student_pdfs/zip`;
    const httpClient = AppInjector.get(HttpClient);
    return httpClient.get<SidekiqJob>(url);
  }
}
