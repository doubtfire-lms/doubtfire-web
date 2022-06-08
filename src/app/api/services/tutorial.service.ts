import { Inject, Injectable } from '@angular/core';
import { analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';
import { CampusService, Tutorial, Unit, UserService } from 'src/app/api/models/doubtfire-model';
import { EntityService } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class TutorialService extends EntityService<Tutorial> {
  protected readonly endpointFormat = 'tutorials/:id:';

  constructor(
    httpClient: HttpClient,
    private campusService: CampusService,
    private userService: UserService,
    @Inject(analyticsService) private AnalyticsService: any
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

}
