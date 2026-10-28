import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Unit} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {MarkingSession} from '../models/marking-session';

@Injectable()
export class MarkingSessionService extends CachedEntityService<MarkingSession> {
  protected readonly endpointFormat = 'units/:unitId:/marking_sessions/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'startTime',
      'endTime',
      'duringTutorial',
      'durationMinutes',

      'commentsAdded',
      'assessments',
      'submissionsOpened',

      {
        keys: ['user', 'user_id'],
        toEntityFn: (data: object, _key: string, markingSession: MarkingSession) => {
          const userRole = markingSession.unit.staff.find((s) => s.user.id === data['user_id']);
          return userRole?.user;
        },
      },
    );
  }

  public createInstanceFrom(json: object, other?: Unit): MarkingSession {
    return new MarkingSession(other);
  }
}
