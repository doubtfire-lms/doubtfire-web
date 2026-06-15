import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  GroupSetService,
  LearningOutcomeService,
  OverseerImageService,
  TaskOutcomeAlignmentService,
  TeachingPeriodService,
  TutorialService,
  TutorialStreamService,
  Unit,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {AppInjector} from 'src/app/app-injector';
import API_URL from 'src/app/config/constants/apiUrl';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {GroupService} from './group.service';
import {MappingFunctions} from './mapping-fn';
import {TaskDefinitionService} from './task-definition.service';
import {UnitRoleService} from './unit-role.service';

export type IloStats = {
  median: number;
  lower: number;
  upper: number;
  min: number;
  max: number;
}[];

export interface TaskStatusStat {
  tutorial_stream_id: number;
  status: string;
  num: number;
}

export type TaskStatusStats = Record<number, Record<number, TaskStatusStat[]>>;

export interface TargetGradeStat {
  tutorial_id: number;
  tutorial_stream_id: number;
  grade: number;
  num: number;
}

export interface TaskCompletionSummary {
  median: number;
  lower: number;
  upper: number;
  min: number;
  max: number;
}

export interface TaskCompletionStats {
  unit: TaskCompletionSummary;
  tutorial: Record<number, TaskCompletionSummary>;
  grade: Record<number, TaskCompletionSummary>;
}

@Injectable()
export class UnitService extends CachedEntityService<Unit> {
  protected readonly endpointFormat = 'units/:id:';
  public readonly rolloverEndpoint = 'units/:id:/rollover';

  constructor(
    httpClient: HttpClient,
    private teachingPeriodService: TeachingPeriodService,
    private tutorialService: TutorialService,
    private tutorialStreamService: TutorialStreamService,
    private learningOutcomeService: LearningOutcomeService,
    private taskDefinitionService: TaskDefinitionService,
    private taskOutcomeAlignmentService: TaskOutcomeAlignmentService,
    private groupSetService: GroupSetService,
    private groupService: GroupService,
  ) {
    super(httpClient, API_URL);

    this.cacheBehaviourOnGet = 'cacheQuery';

    this.mapping.addKeys(
      'id',
      'code',
      'name',
      'description',
      'active',
      'myRole',
      {
        keys: 'unitRole',
        toEntityFn: (data: object, jsonKey: string, _entity: Unit) => {
          const unitRoleService = AppInjector.get(UnitRoleService);
          unitRoleService.cache.get(data[jsonKey]);
        },
      },
      {
        // keys: 'unitRoles',
        keys: 'staff',
        toEntityOp: (data, key, entity) => {
          const unitRoleService = AppInjector.get(UnitRoleService);
          // Add staff
          entity.staffCache.clear();
          data[key]?.forEach((staff) => {
            entity.staffCache.add(unitRoleService.buildInstance(staff));
          });
        },
      },
      {
        keys: ['mainConvenor', 'main_convenor_id'],
        toEntityFn: (data, key, entity) => {
          const result = entity.staffCache.get(data[key]);
          entity.mainConvenorUser = result?.user;
          return result;
        },
        toJsonFn: (unit: Unit, _key: string) => {
          return unit.mainConvenor?.id;
        },
      },
      {
        keys: ['mainConvenorUser', 'main_convenor_user_id'],
        toEntityFn: (data, key, _entity) => {
          return AppInjector.get(UserService).cache.get(data[key]);
        },
        toJsonFn: (unit: Unit, _key: string) => {
          return unit.mainConvenor?.user.id;
        },
      },
      {
        keys: ['teachingPeriod', 'teaching_period_id'],
        toEntityFn: (data, key, entity) => {
          if (data['teaching_period_id']) {
            const teachingPeriod = this.teachingPeriodService.cache.get(data['teaching_period_id']);
            teachingPeriod?.unitsCache.add(entity);
            return teachingPeriod;
          } else {
            return undefined;
          }
        },
        toJsonFn: (entity: Unit, _key: string) => {
          return entity.teachingPeriod ? entity.teachingPeriod.id : undefined;
        },
      },
      {
        keys: 'startDate',
        toEntityFn: (data, key, _entity, _params?) => {
          return new Date(data[key]);
        },
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      {
        keys: 'endDate',
        toEntityFn: (data, key, _entity, _params?) => {
          return new Date(data[key]);
        },
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      'currentUnitWeek',
      {
        keys: 'portfolioAutoGenerationDate',
        toEntityFn: (data, key, _entity, _params?) => {
          return new Date(data[key]);
        },
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      'assessmentEnabled',
      // 'overseerImageId',
      {
        keys: 'overseerImageId',
        toEntityFn: (data, key, entity) => {
          const overSeerEntityId = data[key];
          if (overSeerEntityId) {
            const overseerImageService = AppInjector.get(OverseerImageService);
            overseerImageService.get(data[key]).subscribe({
              next: (image) => {
                entity.overseerImage = image;
              },
            });
          }
          return overSeerEntityId;
        },
        toJsonFn: (unit: Unit, _key: string) => {
          return unit.overseerImage?.id;
        },
      },
      'autoApplyExtensionBeforeDeadline',
      'sendNotifications',
      'enableSyncEnrolments',
      'enableSyncTimetable',
      'allowStudentExtensionRequests',
      'allowFlexibleDates',
      'extensionWeeksOnResubmitRequest',
      'allowStudentChangeTutorial',
      'markLateSubmissionsAsAssessInPortfolio',
      {
        keys: 'ilos',
        toEntityOp: (data: object, key: string, unit: Unit) => {
          data[key]?.forEach((ilo) => {
            unit.learningOutcomesCache.getOrCreate(ilo['id'], this.learningOutcomeService, ilo);
          });
        },
      },
      {
        keys: 'tutorialStreams',
        toEntityOp: (data, key, entity) => {
          data['tutorial_streams'].forEach((streamJson: object) => {
            entity.tutorialStreamsCache.add(
              this.tutorialStreamService.buildInstance(streamJson, {constructorParams: entity}),
            );
          });
        },
      },
      {
        keys: 'tutorials',
        toEntityOp: (data, key, entity) => {
          data['tutorials'].forEach((tutorialJson: object) => {
            if (tutorialJson) {
              entity.tutorialsCache.add(
                this.tutorialService.buildInstance(tutorialJson, {constructorParams: entity}),
              );
            }
          });
        },
      },
      // 'tutorialEnrolments', - map to tutorial enrolments
      {
        keys: 'groupSets',
        toEntityOp: (data, key, unit) => {
          data[key]?.forEach((groupSetJson: object) => {
            unit.groupSetsCache.add(
              this.groupSetService.buildInstance(groupSetJson, {constructorParams: unit}),
            );
          });
        },
      },
      {
        keys: 'groups',
        toEntityOp: (data, key, unit) => {
          data[key]?.forEach((groupJson: object) => {
            const group = this.groupService.buildInstance(groupJson, {constructorParams: unit});
            group.groupSet.groupsCache.add(group);
          });
        },
      },
      {
        keys: 'taskDefinitions',
        toEntityOp: (data, key, unit) => {
          let seq: number = 0;
          data['task_definitions'].forEach((taskDefinitionJson: object) => {
            const td = unit.taskDefinitionCache.getOrCreate(
              taskDefinitionJson['id'],
              this.taskDefinitionService,
              taskDefinitionJson,
              {constructorParams: unit},
            );
            td.seq = seq++;
          });
        },
      },
      {
        keys: ['draftTaskDefinition', 'draft_task_definition_id'],
        toEntityFn: (data: object, jsonKey: string, unit: Unit) => {
          return unit.taskDef(data[jsonKey]);
        },
        toJsonFn: (unit: Unit, _key: string) => {
          return unit.draftTaskDefinition?.id;
        },
      },
      {
        keys: 'taskOutcomeAlignments',
        toEntityOp: (data: object, jsonKey: string, unit: Unit) => {
          data[jsonKey].forEach((alignment) => {
            unit.taskOutcomeAlignmentsCache.getOrCreate(
              alignment['id'],
              this.taskOutcomeAlignmentService,
              alignment,
              {
                constructorParams: unit,
              },
            );
          });
        },
      },
      // 'groupMemberships', - map to group memberships
      'feedbackWarningThresholdDays',
      'feedbackOverflowThresholdDays',
      {
        keys: ['gradeDefinitions', 'grade_definitions'],
      },
      'enforceFeedbackBeforeDiscussedInClass',
    );

    this.mapping.addJsonKey(
      'code',
      'name',
      'description',
      'active',

      'mainConvenor',

      'teachingPeriod',
      'startDate',
      'endDate',
      'portfolioAutoGenerationDate',

      'assessmentEnabled',
      'overseerImageId',

      'autoApplyExtensionBeforeDeadline',
      'markLateSubmissionsAsAssessInPortfolio',
      'sendNotifications',
      'enableSyncEnrolments',
      'enableSyncTimetable',

      'draftTaskDefinition',
      'allowFlexibleDates',
      'allowStudentExtensionRequests',
      'extensionWeeksOnResubmitRequest',
      'allowStudentChangeTutorial',
      'feedbackWarningThresholdDays',
      'feedbackOverflowThresholdDays',
      'gradeDefinitions',
      'enforceFeedbackBeforeDiscussedInClass',
    );
  }

  public override createInstanceFrom(_json: object): Unit {
    return new Unit();
  }

  public loadLearningProgressClassStats(unit: Unit): Observable<IloStats> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/learning_alignments/class_stats`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<IloStats>(url);
  }

  public loadLearningProgressClassDetails(unit: Unit): Observable<IloStats[]> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/learning_alignments/class_details`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<IloStats[]>(url);
  }

  public taskStatusCountByTutorial(unit: Unit): Observable<TaskStatusStats> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/stats/task_status_pct`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<TaskStatusStats>(url);
  }

  public targetGradeStats(unit: Unit): Observable<TargetGradeStat[]> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/stats/student_target_grade`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<TargetGradeStat[]>(url);
  }

  public taskCompletionStats(unit: Unit): Observable<TaskCompletionStats> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/stats/task_completion_stats`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<TaskCompletionStats>(url);
  }

  public zipPortfolios(unit: Unit): Observable<SidekiqJob> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/submission/units/${unit.id}/portfolio/zip`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<SidekiqJob>(url);
  }
}
