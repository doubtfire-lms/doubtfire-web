import { HttpClient } from '@angular/common/http';
import { CachedEntityService } from 'ngx-entity-service';
import { TeachingPeriodBreak } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';
import { MappingFunctions } from './mapping-fn';

@Injectable()
export class TeachingPeriodBreakService extends CachedEntityService<TeachingPeriodBreak> {
  protected readonly endpointFormat = 'teaching_periods/:teaching_period_id:/breaks/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      {
        keys: 'startDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson
      },
      'numberOfWeeks',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public override createInstanceFrom(json: any, other?: any): TeachingPeriodBreak {
    return new TeachingPeriodBreak();
  }
}
