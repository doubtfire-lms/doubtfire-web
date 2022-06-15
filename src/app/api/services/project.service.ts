import { CachedEntityService, RequestOptions } from 'ngx-entity-service';
import { CampusService, Project, Unit, UnitService, UserService, Task } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { AppInjector } from 'src/app/app-injector';
import { Observable } from 'rxjs';
import { TaskService } from './task.service';
import { MappingProcess } from 'ngx-entity-service/lib/mapping-process';
import { TaskOutcomeAlignmentService } from './task-outcome-alignment.service';

@Injectable()
export class ProjectService extends CachedEntityService<Project> {
  protected readonly endpointFormat = 'projects/:id:';

  public readonly studentEndpointFormat = 'students';

  constructor(
    httpClient: HttpClient,
    private campusService: CampusService,
    private userService: UserService,
    private taskService: TaskService,
    private taskOutcomeAlignmentService: TaskOutcomeAlignmentService
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      //TODO: stats?
      'id',
      {
        keys: ['campus', 'campus_id'],
        toEntityOp: (data: object, key: string, entity: Project, params?: any) => {
          this.campusService.get(data['campus_id']).subscribe(campus => { entity.campus = campus; });
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

          entity.student = this.userService.cache.get(userId);
        }
      },
      'enrolled',
      'targetGrade',
      'submittedGrade',
      'portfolioFiles',
      'compilePortfolio',
      'portfolioAvailable',
      'usesDraftLearningSummary',
      'taskStats',
      'burndownChartData',
      {
        keys: 'tutorialEnrolments',
        toEntityOp: (data: object, key: string, project: Project, params?: any) => {
          const unit: Unit = project.unit;
          data[key].forEach(tutorialEnrolment => {
            const tutorial = unit.tutorialsCache.get(tutorialEnrolment['tutorial_id']);
            project.tutorialEnrolmentsCache.add(tutorial);
          });
        }
      },
      // 'groups',
      {
        keys: 'taskOutcomeAlignments',
        toEntityOp: (data: object, key: string, project: Project, params?: any) => {
          data[key].forEach(alignment => {
            project.taskOutcomeAlignmentsCache.getOrCreate(
              alignment['id'],
              taskOutcomeAlignmentService,
              alignment,
              {
                constructorParams: project
              }
            );
          });
        }
      },
      'grade',
      'gradeRationale',
      {
        keys: 'unit',
        toEntityFn: (data: object, key: string, entity: Project, params?: any) => {
          const unitService: UnitService = AppInjector.get(UnitService);
          const unitData = data['unit'];
          return unitService.cache.getOrCreate(unitData.id, unitService, unitData);
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
            process.continue();
          });
        }
      },
      {
        keys: 'tasks',
        toEntityOp: (data: object, key: string, project: Project, params?: any) => {
          // create tasks from json
          data['tasks'].forEach(taskData => {
            project.taskCache.getOrCreate(taskData['id'], this.taskService, taskData, {constructorParams: project});
          });

          // create not started tasks...
          project.unit.taskDefinitions.forEach(taskDefinition => {
            if (!project.findTaskForDefinition(taskDefinition.id)) {
              const task = new Task(project);
              task.definition = taskDefinition;
              // add to cache using task definition abbreviation as key
              project.taskCache.set(taskDefinition.abbreviation.toString(), task);
            }
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
      'gradeRationale'
    );
  }

  public createInstanceFrom(json: object, other?: any): Project {
    return new Project(other as Unit);
  }

  public loadStudent(unit: Unit, includeWithdrawnStudents: boolean = false): Observable<Project[]> {
    const options: RequestOptions<Project> = {
      cache: unit.studentCache,
      endpointFormat: this.studentEndpointFormat,
      params: {
        all: includeWithdrawnStudents
      }
    }
    return super.query(undefined, options);
  }
}
