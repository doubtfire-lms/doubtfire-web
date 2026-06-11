import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TiiAction} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {MappingFunctions} from './mapping-fn';

@Injectable()
export class TiiActionService extends CachedEntityService<TiiAction> {
  protected readonly endpointFormat = 'tii_actions/:id:';

  public static readonly rolloverEndpointFormat = 'teaching_periods/:id:/rollover';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'type',
      'description',
      'complete',
      'retries',
      'retry',
      {
        keys: 'lastRun',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      'errorCode',
      'errorMessage',
      'log',
    );

    this.mapping.addJsonKey('id', 'retry');
    // this.cacheBehaviourOnGet = 'cacheQuery';
  }

  public createInstanceFrom(_json: object): TiiAction {
    return new TiiAction();
  }
}
