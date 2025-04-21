import { CachedEntityService, RequestOptions } from 'ngx-entity-service';
import { CampusService, Project, Unit, UnitService, UserService } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { AppInjector } from 'src/app/app-injector';
import { Observable } from 'rxjs';
import { TaskService } from './task.service';
import { MappingProcess } from 'ngx-entity-service/lib/mapping-process';
import { TaskOutcomeAlignmentService } from './task-outcome-alignment.service';
import { GroupService } from './group.service';

@Injectable()
export class ProjectService extends CachedEntityService<Project> {
  protected readonly endpointFormat = 'projects/:id:';

  public readonly studentEndpointFormat = 'students';

  constructor(
    httpClient: HttpClient,
    private campusService: CampusService,
    private userService: UserService,
    private taskService: TaskService,
    private taskOutcomeAlignmentService: TaskOutcomeAlignmentService,
    private groupService: GroupService
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      //TODO: stats?
      'id',
      {
        keys: ['campus', 'campus_id'],
        toEntityOp: (data: object, key: string, entity: Project, params?: any) => {
          if (data['campus_id']) {
            return this.campusService.get(data['campus_id']).subscribe(campus => { entity.campus = campus; });
          }
        },
        toJsonFn: (entity: Project, key: string) => {
          return entity.campus ? entity.campus.id : entity.originalJson['camput_id'] ? -1 : null;
        }
      },
      {
        keys: 'student',
        toEntityFn: (data: object, key: string, entity: Project, params?: any) => {
          const userData = data['student'];

          return this.userService.cache.getOrCreate(userData.id, this.userService, userData);
        }
      },
      {
        keys: 'userId',
        toEntityOp: (data: object, key: string, entity: Project, params?: any) => {
          const userId = data['user_id'];

          this.userService.get(userId).subscribe({
            next: (user) => {
              entity.student = user;
            }
          });
        }
      },
      'enrolled',
      'targetGrade',
      'submittedGrade',
      'portfolioFiles',
      'compilePortfolio',
      'similarityFlag',
      {
        keys: 'hasPortfolio',
        toEntityFn: (data: object, key: string, entity: Project, params?: any) => {
          const result = data[key] === true;

          if (result) entity.portfolioStatus = 1;
          else if (entity.compilePortfolio) entity.portfolioStatus = 0.5;
          else entity.portfolioStatus = 0;

          return result;
        }
      },
      'portfolioAvailable',
      'usesDraftLearningSummary',
      {
        keys: ['taskStats', 'stats'],
        toEntityOp: (data: object, key: string, entity: Project, params?: any) => {
          const values = data[key];
          entity.taskStats = [
            {
              key: "fail",
              value: Math.round((values['red_pct'] || 0) * 100)
            },
            {
              key: "not_started",
              value: Math.round((values['grey_pct'] || 1) * 100),
            },
            {
              key: "working_on_it",
              value: Math.round((values['orange_pct'] ||  0) * 100),
            },
            {
              key: "ready_for_feedback",
              value: Math.round((values['blue_pct'] || 0) * 100),
            },
            {
              key: "complete",
              value: Math.round((values['green_pct'] || 0) * 100)
            }
          ];

          entity.orderScale = Math.round((values['order_scale'] || 0) * 100);
        }
      },
      'grade',
      'gradeRationale',
      {
        keys: 'unit',
        toEntityFn: (data: object, key: string, entity: Project, params?: any) => {
          const unitService: UnitService = AppInjector.get(UnitService);
          const unitData = data['unit'];
          const result = unitService.cache.getOrCreate(unitData.id, unitService, unitData);
          result.studentCache.add(entity);
          return result;
        },
        toJsonFn: (entity: Project, key: string) => {
          return entity.unit?.id;
        }
      },
      {
        keys: 'unitId',
        toEntityOpAsync: (process: MappingProcess<Project>) => {
          const unitService: UnitService = AppInjector.get(UnitService);
          const unitId = process.data['unit_id'];
          // Load what we have... or a a stub for now...
          process.entity.unit = unitService.cache.getOrCreate(unitId, unitService, { id: unitId });
          return unitService.get(unitId).subscribe(unit => {
            process.entity.unit = unit;
            unit.studentCache.add(process.entity);
            process.continue();
          });
        }
      },
      {
        keys: 'tutorialEnrolments',
        toEntityOp: (data: object, key: string, project: Project, params?: any) => {
          const unit: Unit = project.unit;
          data[key]?.forEach((tutorialEnrolment: {tutorial_id: number}) => {
            if (tutorialEnrolment.tutorial_id) {
              const tutorial = unit.tutorialsCache.get(tutorialEnrolment.tutorial_id);
              project.tutorialEnrolmentsCache.add(tutorial);
            }
          });
        }
      },
      {
        keys: 'groups',
        toEntityOp: (data: object, key: string, project: Project, params?: any) => {
          data[key]?.forEach((group) => {
            const theGroup = project.unit.groupSetsCache
              .get(group.group_set_id)
              .groupsCache.getOrCreate(group.id, this.groupService, group, {
                constructorParams: project.unit,
              });

            project.groupCache.add(theGroup);
            theGroup.projectsCache.add(project);
          });
        },
        toJsonFn: (entity: Project, key: string) => {
          return entity.unit?.id;
        }
      },
      {
        keys: 'tasks',
        toEntityOp: (data: object, key: string, project: Project, params?: any) => {
          // create tasks from json
          data['tasks']?.forEach((taskData) => {
            project.taskCache.getOrCreate(taskData['id'], this.taskService, taskData, {constructorParams: project});
          });

          project.unit.setupTasksForStudent(project);
        }
      },
      {
        keys: 'taskOutcomeAlignments',
        toEntityOp: (data: object, key: string, project: Project, params?: any) => {
          data[key]?.forEach((alignment) => {
            project.taskOutcomeAlignmentsCache.getOrCreate(
              alignment['id'],
              taskOutcomeAlignmentService,
              alignment,
              {
                constructorParams: project,
              },
            );
          });
        }
      },
    );

    this.mapping.addJsonKey(
      'enrolled',
      'targetGrade',
      'submittedGrade',
      'compilePortfolio',
      'grade',
      'gradeRationale',
      'campus'
    );
  }

  public createInstanceFrom(json: object, other?: any): Project {
    return new Project(other as Unit);
  }

  public loadStudents(unit: Unit, withdrawnOnly: boolean = false, useFetch: boolean = false): Observable<Project[]> {
    const options: RequestOptions<Project> = {
      cache: unit.studentCache,
      endpointFormat: this.studentEndpointFormat,
      params: {
        withdrawn: withdrawnOnly,
        unit_id: unit.id
      },
      constructorParams: unit
    }

    if (useFetch) {
      return super.fetchAll(undefined, options);
    } else {
      return super.query(undefined, options);
    }
  }

  public loadProject(proj: Project | number, unit: Unit, useFetch: boolean = false): Observable<Project> {
    const options: RequestOptions<Project> = {
      cache: unit.studentCache,
      sourceCache: unit.studentCache,
      constructorParams: unit,
      cacheBehaviourOnGet: "cacheQuery"
    }

    if (useFetch) {
      return super.fetch(proj, options);
    } else {
      return super.get(proj, options);
    }
  }
}
