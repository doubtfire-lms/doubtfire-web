import {CachedEntityService} from 'ngx-entity-service';
import {LearningOutcome} from 'src/app/api/models/doubtfire-model';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class LearningOutcomeService extends CachedEntityService<LearningOutcome> {
  protected readonly endpointFormat = ':contextType:/:contextId:/outcomes';
  public static updateEndpoint = ':contextType:/:contextId:/outcomes/:id:';
  public static globalEndpoint = 'global/outcomes';
  public static updateGlobalEndpoint = 'global/outcomes/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'contextId',
      'contextType',
      'abbreviation',
      'shortDescription',
      'fullOutcomeDescription',
      'linkedOutcomeIds',
    );

    this.mapping.mapAllKeysToJsonExcept('id', 'context');
  }

  public createInstanceFrom(json: object, other?: any): LearningOutcome {
    return new LearningOutcome();
  }
}
