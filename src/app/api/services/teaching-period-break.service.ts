import {CachedEntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TeachingPeriodBreak} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {MappingFunctions} from './mapping-fn';

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
        toJsonFn: MappingFunctions.mapDayToJson,
      },
      'numberOfWeeks',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public override createInstanceFrom(_json: object): TeachingPeriodBreak {
    return new TeachingPeriodBreak();
  }
}
