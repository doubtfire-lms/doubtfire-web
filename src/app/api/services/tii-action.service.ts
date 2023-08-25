import { HttpClient } from '@angular/common/http';
import { CachedEntityService, Entity } from 'ngx-entity-service';
import { TiiAction, Unit, UnitService, UserService } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';
import { AppInjector } from 'src/app/app-injector';
import { MappingFunctions } from './mapping-fn';
import { MappingProcess } from 'ngx-entity-service/lib/mapping-process';

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
      'log'
    );

    this.mapping.addJsonKey('id', 'retry');
    // this.cacheBehaviourOnGet = 'cacheQuery';
  }

  public createInstanceFrom(json: any, other?: any): TiiAction {
    return new TiiAction();
  }
}
