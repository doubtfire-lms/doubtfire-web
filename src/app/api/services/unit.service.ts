import { Inject, Injectable } from '@angular/core';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';
import { GroupSetService, LearningOutcomeService, TeachingPeriodService, TutorialService, TutorialStreamService, Unit } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService, Entity, EntityMapping } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { UnitRoleService } from './unit-role.service';
import { AppInjector } from 'src/app/app-injector';
import { TaskDefinitionService } from './task-definition.service';

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
    private groupSetService: GroupSetService,
    @Inject(currentUser) private CurrentUser: any,
    @Inject(auth) private Auth: any,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'code',
      'name',
      'description',
      'active',
      'myRole',
      // 'staff', - map to unit roles
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
      // 'mainConvenor', - need to map to unit role
      {
        keys: 'mainConvenor',
        toEntityOp: (data, key, entity) => {
          entity.mainConvenor = entity.staff.get(data['mainConvenor']);
        }
      },

      // 'teachingPeriod', - map to teaching period
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
          return new Date(data['start_date']);
        },
        toJsonFn: (entity, key) => {
          return entity.startDate.toISOString();
        }
      },

      {
        keys: 'endDate',
        toEntityFn: (data, key, entity, params?) => {
          return new Date(data['end_date']);
        },
        toJsonFn: (entity, key) => {
          return entity.endDate.toISOString();
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
      // 'learningOutcomes', - map to learning outcomes
      {
        keys: 'learningOutcomes',
        toEntityOp: (data, key, entity) => {

        }
      },
      // 'tutorialStreams', - map to tutorial streams
      {
        keys: 'tutorialStreams',
        toEntityOp: (data, key, entity) => {
          data['tutorial_streams'].forEach((streamJson: object) => {
            entity.tutorialStreams.add(this.tutorialStreamService.buildInstance(streamJson, entity));
          });
        }
      },
      // 'tutorials', - map to tutorials
      {
        keys: 'tutorials',
        toEntityOp: (data, key, entity) => {
          data['tutorials'].forEach((tutorialJson: object) => {
            entity.tutorials.add(this.tutorialService.buildInstance(tutorialJson, entity));
          });
        }
      },
      // 'tutorialEnrolments', - map to tutorial enrolments
      // 'taskDefinitions', - map to task definitions
      {
        keys: 'taskDefinitions',
        toEntityOp: (data, key, unit) => {
          data['task_definitions'].forEach((taskDefinitionJson: object) => {
            unit.taskDefinitions.add(this.taskDefinitionService.buildInstance(taskDefinitionJson, unit));
          });
        }
      },
      // 'taskOutcomeAlignments', - map to task outcome alignments
      // 'groupSets', - map to group sets
      {
        keys: 'groupSets',
        toEntityOp: (data, key, unit) => {
          data['group_sets'].forEach((groupSetJson: object) => {
            unit.groupSets.add(this.groupSetService.buildInstance(groupSetJson));
          });
        }
      }
      // 'groups', - map to groups
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
