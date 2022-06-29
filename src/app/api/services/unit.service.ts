import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupSetService, LearningOutcomeService, TaskOutcomeAlignmentService, TeachingPeriodService, TutorialService, TutorialStreamService, Unit } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService, Entity, EntityMapping } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { UnitRoleService } from './unit-role.service';
import { AppInjector } from 'src/app/app-injector';
import { TaskDefinitionService } from './task-definition.service';
import { GroupService } from './group.service';

@Injectable()
export class UnitService extends CachedEntityService<Unit> {
  protected readonly endpointFormat = 'units/:id:';

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
        toEntityFn: (data: object, jsonKey: string, entity: Unit) => {
          const unitRoleService = AppInjector.get(UnitRoleService);
          unitRoleService.cache.get(data[jsonKey]);
        }
      },
      {
        keys: 'staff',
        toEntityOp: (data, key, entity) => {
          const unitRoleService = AppInjector.get(UnitRoleService);
          // Add staff
          entity.staff.clear();
          data['staff'].forEach(staff => {
            entity.staff.add(unitRoleService.buildInstance(staff));
          });
        }
      },
      {
        keys: 'mainConvenor',
        toEntityOp: (data, key, entity) => {
          entity.mainConvenor = entity.staff.get(data['mainConvenor']);
        }
      },
      {
        keys: ['teachingPeriod', 'teaching_period_id'],
        toEntityFn: (data, key, entity) => {
          if ( data['teaching_period_id'] ) {
            entity.teachingPeriod = this.teachingPeriodService.cache.get(data['teaching_period_id']);
          }
        }
      },
      {
        keys: 'startDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data[key]);
        },
        toJsonFn: (entity, key) => {
          return entity.startDate.toISOString().slice(0,10);
        }
      },
      {
        keys: 'endDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data[key]);
        },
        toJsonFn: (entity, key) => {
          return entity.endDate.toISOString().slice(0,10);;
        }
      },
      'assessmentEnabled',
      'overseerImageId',
      'autoApplyExtensionBeforeDeadline',
      'sendNotifications',
      'enableSyncEnrolments',
      'enableSyncTimetable',

      'draftTaskDefinitionId',

      'allowStudentExtensionRequests',
      'extensionWeeksOnResubmitRequest',
      'allowStudentChangeTutorial',
      {
        keys: 'learningOutcomes',
        toEntityOp: (data: object, key: string, unit: Unit) => {
          data[key].forEach(ilo => {
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
            entity.tutorialsCache.add(this.tutorialService.buildInstance(tutorialJson, {constructorParams: entity}));
          });
        }
      },
      // 'tutorialEnrolments', - map to tutorial enrolments
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
      {
        keys: 'groupSets',
        toEntityOp: (data, key, unit) => {
          data['group_sets'].forEach((groupSetJson: object) => {
            unit.groupSetsCache.add(this.groupSetService.buildInstance(groupSetJson));
          });
        }
      },
      {
        keys: 'groups',
        toEntityOp: (data, key, unit) => {
          data['groups'].forEach((groupJson: object) => {
            unit.groupsCache.add(this.groupService.buildInstance(groupJson, {constructorParams: unit}));
          });
        }
      }
      // 'groupMemberships', - map to group memberships
    );

    this.mapping.addJsonKey(
      'code',
      'name',
      'description',
      'active',
      // 'mainConvenor', - need to map to unit role
      // 'teachingPeriod', - map to teaching period
      'startDate',
      'endDate',
      'assessmentEnabled',
      // 'overseerImage', - map to overseer image
      'autoApplyExtensionBeforeDeadline',
      'sendNotifications',
      'enableSyncEnrolments',
      'enableSyncTimetable',

      // 'draftTaskDefinition', - map to task definition

      'allowStudentExtensionRequests',
      'extensionWeeksOnResubmitRequest',
      'allowStudentChangeTutorial'
    );
  }

  public override createInstanceFrom(json: any, other?: any): Unit {
    return new Unit();
  }
}
