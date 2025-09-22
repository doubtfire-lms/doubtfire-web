import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupSetService, LearningOutcomeService, TaskOutcomeAlignmentService, TeachingPeriodService, TutorialService, TutorialStreamService, Unit, UserService } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService, Entity, EntityMapping } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { UnitRoleService } from './unit-role.service';
import { AppInjector } from 'src/app/app-injector';
import { TaskDefinitionService } from './task-definition.service';
import { GroupService } from './group.service';
import { Observable } from 'rxjs';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

export type IloStats = {
  median: number;
  lower: number;
  upper: number;
  min: number;
  max: number;
}[];

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
    private groupService: GroupService
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
        toEntityFn: (data: object, jsonKey: string, entity: Unit) => {
          const unitRoleService = AppInjector.get(UnitRoleService);
          unitRoleService.cache.get(data[jsonKey]);
        },
      },
      {
        keys: 'unitRoles',
        toEntityOp: (data, key, entity) => {
          const unitRoleService = AppInjector.get(UnitRoleService);
          // Add staff
          entity.staffCache.clear();
          data[key]?.forEach(staff => {
            entity.staffCache.add(unitRoleService.buildInstance(staff));
          });
        }
      },
      {
        keys: ['mainConvenor', 'main_convenor_id'],
        toEntityFn: (data, key, entity) => {
          let result = entity.staffCache.get(data[key]);
          entity.mainConvenorUser = result?.user;
          return result;
        },
        toJsonFn: (unit: Unit, key: string) => {
          return unit.mainConvenor?.id;
        }
      },
      {
        keys: ['mainConvenorUser', 'main_convenor_user_id'],
        toEntityFn: (data, key, entity) => {
          return AppInjector.get(UserService).cache.get(data[key]);
        },
        toJsonFn: (unit: Unit, key: string) => {
          return unit.mainConvenor?.user.id;
        }
      },
      {
        keys: ['teachingPeriod', 'teaching_period_id'],
        toEntityFn: (data, key, entity) => {
          if ( data['teaching_period_id'] ) {
            const teachingPeriod = this.teachingPeriodService.cache.get(data['teaching_period_id']);
            teachingPeriod?.unitsCache.add(entity);
            return teachingPeriod;
          } else { return undefined; }
        },
        toJsonFn: (entity: Unit, key: string) => {
          return entity.teachingPeriod ? entity.teachingPeriod.id : undefined;
        }
      },
      {
        keys: 'startDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data[key]);
        },
        toJsonFn: (entity, key) => {
          return entity.startDate.toISOString().slice(0, 10);
        }
      },
      {
        keys: 'endDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data[key]);
        },
        toJsonFn: (entity, key) => {
          return entity.endDate.toISOString().slice(0, 10);
        }
      },
      {
        keys: 'portfolioAutoGenerationDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data[key]);
        },
        toJsonFn: (entity, key) => {
          return entity.portfolioAutoGenerationDate?.toISOString().slice(0, 10);
        }
      },
      'assessmentEnabled',
      'overseerImageId',
      'autoApplyExtensionBeforeDeadline',
      'sendNotifications',
      'enableSyncEnrolments',
      'enableSyncTimetable',
      'allowStudentExtensionRequests',
      'extensionWeeksOnResubmitRequest',
      'allowStudentChangeTutorial',
      {
        keys: 'ilos',
        toEntityOp: (data: object, key: string, unit: Unit) => {
          data[key]?.forEach(ilo => {
            unit.learningOutcomesCache.getOrCreate(ilo['id'], this.learningOutcomeService, ilo);
          });
        }
      },
      {
        keys: 'tutorialStreams',
        toEntityOp: (data, key, entity) => {
          data['tutorial_streams'].forEach((streamJson: object) => {
            entity.tutorialStreamsCache.add(this.tutorialStreamService.buildInstance(streamJson, {constructorParams: entity}));
          });
        }
      },
      {
        keys: 'tutorials',
        toEntityOp: (data, key, entity) => {
          data['tutorials'].forEach((tutorialJson: object) => {
            if (tutorialJson) {
              entity.tutorialsCache.add(this.tutorialService.buildInstance(tutorialJson, {constructorParams: entity}));
            }
          });
        }
      },
      // 'tutorialEnrolments', - map to tutorial enrolments
      {
        keys: 'groupSets',
        toEntityOp: (data, key, unit) => {
          data[key]?.forEach((groupSetJson: object) => {
            unit.groupSetsCache.add(this.groupSetService.buildInstance(groupSetJson, {constructorParams: unit}));
          });
        }
      },
      {
        keys: 'groups',
        toEntityOp: (data, key, unit) => {
          data[key]?.forEach((groupJson: object) => {
            const group = this.groupService.buildInstance(groupJson, {constructorParams: unit});
            group.groupSet.groupsCache.add(group);
          });
        }
      },
      {
        keys: 'taskDefinitions',
        toEntityOp: (data, key, unit) => {
          var seq: number = 0;
          data['task_definitions'].forEach((taskDefinitionJson: object) => {
            const td = unit.taskDefinitionCache.getOrCreate(taskDefinitionJson['id'], this.taskDefinitionService, taskDefinitionJson, {constructorParams: unit});
            td.seq = seq++;
          });
        }
      },
      {
        keys: ['draftTaskDefinition', 'draft_task_definition_id'],
        toEntityFn: (data: object, jsonKey: string, unit: Unit) => {
          return unit.taskDef(data[jsonKey]);
        },
        toJsonFn: (unit: Unit, key: string) => {
          return unit.draftTaskDefinition?.id;
        }
      },
      {
        keys: 'taskOutcomeAlignments',
        toEntityOp: (data: object, jsonKey: string, unit: Unit) => {
          data[jsonKey].forEach( (alignment) => {
            unit.taskOutcomeAlignmentsCache.getOrCreate(
              alignment['id'],
              this.taskOutcomeAlignmentService,
              alignment,
              {
                constructorParams: unit
              }
            );
          });
        }
      },
      // 'groupMemberships', - map to group memberships
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
      // 'overseerImage', - map to overseer image

      'autoApplyExtensionBeforeDeadline',
      'sendNotifications',
      'enableSyncEnrolments',
      'enableSyncTimetable',

      'draftTaskDefinition',
      'allowStudentExtensionRequests',
      'extensionWeeksOnResubmitRequest',
      'allowStudentChangeTutorial'
    );
  }

  public override createInstanceFrom(json: any, other?: any): Unit {
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

  public taskStatusCountByTutorial(unit: Unit): Observable<any> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/stats/task_status_pct`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<any>(url);
  }

  public targetGradeStats(unit: Unit): Observable<any> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/stats/student_target_grade`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<any>(url);
  }

  public taskCompletionStats(unit: Unit): Observable<any> {
    const url = `${AppInjector.get(DoubtfireConstants).API_URL}/units/${unit.id}/stats/task_completion_stats`;
    const httpClient = AppInjector.get(HttpClient);

    return httpClient.get<any>(url);
  }
}
