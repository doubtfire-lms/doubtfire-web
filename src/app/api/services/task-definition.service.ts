import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  LearningOutcomeService,
  TaskDefinition,
  TaskStatusEnum,
  Unit,
} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import API_URL from 'src/app/config/constants/apiUrl';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SidekiqJob} from '../models/sidekiq-job';
import {TaskPrerequisite} from '../models/task-prerequisite';
import {MappingFunctions} from './mapping-fn';
import {OverseerStepService} from './overseer-step.service';
import {TaskPrerequisiteService} from './task-prerequisite.service';

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
      'requiresDiscussion',
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
        toJsonFn: (taskDef: TaskDefinition, _key: string) => {
          return JSON.stringify(
            taskDef.uploadRequirements?.map((upreq) => {
              return {
                key: upreq.key,
                name: upreq.name,
                type: upreq.type,
                tii_check: upreq.tiiCheck,
                tii_pct: upreq.tiiPct,
                submission_history: upreq.submissionHistory,
              };
            }),
          );
        },
        toEntityFn: (data: object, key: string) => {
          return (
            data[key] as {
              key: string;
              name: string;
              type: string;
              tii_check: boolean;
              tii_pct: number;
              submission_history: boolean;
            }[]
          )?.map((upreq) => {
            return {
              key: upreq.key,
              name: upreq.name,
              type: upreq.type,
              tiiCheck: upreq.tii_check,
              tiiPct: upreq.tii_pct,
              submissionHistory: upreq.submission_history,
            };
          });
        },
      },
      {
        keys: ['tutorialStream', 'tutorial_stream_abbr'],
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition) => {
          return taskDef.unit.tutorialStreamsCache.get(data[key]);
        },
        toJsonFn: (taskDef: TaskDefinition, _key: string) => {
          return taskDef.tutorialStream?.abbreviation;
        },
      },
      'plagiarismWarnPct',
      'restrictStatusUpdates',
      {
        keys: ['groupSet', 'group_set_id'],
        toEntityFn: (data: object, key: string, taskDef: TaskDefinition) => {
          if (data[key]) {
            return taskDef.unit.groupSetsCache.get(data[key]);
          } else {
            return data[key];
          }
        },
        toJsonFn: (taskDef: TaskDefinition, _key: string) => {
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
          taskDefinition.overseerStepsCache.clear();
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
      {
        keys: ['gradeDueDates', 'grade_due_dates'],
        toEntityFn: (data: object, key: string) => {
          return (data[key] ?? []).map((gradeDate) => ({
            targetGrade: gradeDate.target_grade,
            targetDueDate: gradeDate.target_due_date
              ? MappingFunctions.mapDateToDay(gradeDate, 'target_due_date', null)
              : undefined,
            startDate: gradeDate.start_date
              ? MappingFunctions.mapDateToDay(gradeDate, 'start_date', null)
              : undefined,
          }));
        },
        toJsonFn: (taskDefinition: TaskDefinition) => {
          return taskDefinition.gradeDueDates.map((gradeDate) => ({
            target_grade: gradeDate.targetGrade,
            target_due_date: gradeDate.targetDueDate
              ? MappingFunctions.mapDayToJson(gradeDate, 'targetDueDate')
              : undefined,
            start_date: gradeDate.startDate
              ? MappingFunctions.mapDayToJson(gradeDate, 'startDate')
              : undefined,
          }));
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

  public override createInstanceFrom(_json: object, other?: Unit): TaskDefinition {
    return new TaskDefinition(other);
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
