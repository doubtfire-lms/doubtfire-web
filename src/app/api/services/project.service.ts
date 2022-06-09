import { CachedEntityService, RequestOptions } from 'ngx-entity-service';
import { CampusService, Project, Unit, UnitService, UserService } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { AppInjector } from 'src/app/app-injector';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { TaskService } from './task.service';

@Injectable()
export class ProjectService extends CachedEntityService<Project> {
  protected readonly endpointFormat = 'projects/:id:';

  public readonly studentEndpointFormat = 'students';

  constructor(
    httpClient: HttpClient,
    private campusService: CampusService,
    private userService: UserService,
    private taskService: TaskService
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
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
      'id',
      {
        keys: ['campus','campus_id'],
        toEntityOp: (data: object, key: string, entity: Project, params?: any) => {
          this.campusService.get(data['campus_id']).subscribe(campus => {entity.campus = campus;});
        }
      },
      {
        keys: ['student'],
        toEntityFn: (data: object, key: string, entity: Project, params?: any) => {
          const userData = data['student'];

          return this.userService.cache.getOrCreate(userData.id, this.userService, userData);
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
      // 'tasks',
      {
        keys: 'tasks',
        toEntityOp: (data: object, key: string, entity: Project, params?: any) => {
          data['tasks'].forEach(taskData => {
            entity.tasks.getOrCreate(taskData['id'], this.taskService, taskData, entity);
          });
        }
      },
      // 'tutorialEnrolments',
      // 'groups',
      // 'taskOutcomeAlignments',
      'grade',
      'gradeRationale',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
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
