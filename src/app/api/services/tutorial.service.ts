import { Inject, Injectable } from '@angular/core';
import { alertService, analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';
import { CampusService, Project, Tutorial, Unit, UserService } from 'src/app/api/models/doubtfire-model';
import { EntityService, RequestOptions } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { Observable } from 'rxjs';

@Injectable()
export class TutorialService extends EntityService<Tutorial> {
  protected readonly endpointFormat = 'tutorials/:id:';
  protected readonly switchTutorialEndpointFormat = 'units/:unitId:/tutorials/:tutorialAbbreviation:/enrolments/:projectId:';

  constructor(
    httpClient: HttpClient,
    private campusService: CampusService,
    private userService: UserService,
    @Inject(analyticsService) private AnalyticsService: any,
    @Inject(alertService) private alertService: any
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'meetingDay',
      'meetingTime',
      'meetingLocation',
      'abbreviation',
      {
        keys: ['campus','campus_id'],
        toEntityOp: (data: object, key: string, entity: Tutorial, params?: any) => {
          this.campusService.get(data['campus_id']).subscribe(campus => {entity.campus = campus;});
        }
      },

      'capacity',
      {
        keys: ['tutor', 'tutor_id'],
        toEntityFn: (data: object, key: string, entity: Tutorial, params?: any) => {
          return this.userService.cache.getOrCreate(data['tutor'].id, userService, data['tutor']);
        },
        toJsonFn: (entity: Tutorial, key: string) => {
          return entity.tutor?.id;
        }
      },

      'numStudents',
      {
        keys: 'tutorialStream',
        toEntityFn: (data: object, key: string, entity: Tutorial, params?: any) => {
          return entity.unit.tutorialStreamForAbbr(data['tutorial_stream']);
        }
      },

      {
        keys: ['unit', 'unit_id'],
        toJsonFn: (entity: Tutorial, key: string) => {
          return entity.unit?.id;
        }
      }
    );

    this.mapping.mapAllKeysToJson();
  }

  public createInstanceFrom(json: any, other?: any): Tutorial {
    return new Tutorial(other as Unit);
  }

  public override keyForJson(json: any): string {
    if ( json.tutorial_id ) {
      return json.tutorial_id;
    } else {
      return super.keyForJson(json);
    }
  }

  public switchTutorial(project: Project, tutorial: Tutorial, isEnrol: boolean): void {
    const pathIds = {
      unitId: project.unit.id,
      tutorialAbbreviation: tutorial.abbreviation,
      projectId: project.id
    };

    const options: RequestOptions<Tutorial> = {
      endpointFormat: this.switchTutorialEndpointFormat,
      cache: project.tutorialEnrolmentsCache,
      sourceCache: project.unit.tutorialsCache
    };

    var observer: Observable<object>;
    if (isEnrol) {
      observer = this.create(pathIds, options);
    } else {
      observer = this.delete(pathIds, options);
    }

    observer.subscribe({
      next: (value: object) => {
        this.alertService.add("success", `Tutorial enrolment updated for ${project.student.name}`, 3000)
      },
      error: (error) => {
        this.alertService.add("danger", `Failed to update tutorial enrolment. ${error}`, 8000);
      }
    });
  }

}
