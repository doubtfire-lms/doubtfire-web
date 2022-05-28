import { HttpClient } from '@angular/common/http';
import { CachedEntityService, Entity } from 'ngx-entity-service';
import { TeachingPeriod, TeachingPeriodBreakService, UnitService } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';
import { AppInjector } from 'src/app/app-injector';

@Injectable()
export class TeachingPeriodService extends CachedEntityService<TeachingPeriod> {
  protected readonly endpointFormat = 'teaching_periods/:id:';

  public static readonly rolloverEndpointFormat = 'teaching_periods/:id:/rollover';

  constructor(  httpClient: HttpClient,
                private teachingPeriodBreakService: TeachingPeriodBreakService) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'period',
      'year',
      'startDate',
      'endDate',
      'activeUntil',
      'active',
      {
        keys: 'breaks',
        toEntityOp: (data, key, entity) => {
          data['breaks']?.forEach(breakJson => {
            const teachingPeriod = entity as TeachingPeriod;
            const breakEntity = this.teachingPeriodBreakService.buildInstance(breakJson);
            teachingPeriod.breaks.add(breakEntity);
          });
        }
      },
      {
        keys: 'units',
        toEntityOp: (data, key, entity) => {
          data['units']?.forEach(unitJson => {
            const unitService: UnitService = AppInjector.get(UnitService);
            const unit = unitService.cache.getOrCreate(
              unitJson['id'],
              unitService,
              unitJson // has id, name, code, and active
            );
            entity.units.add(unit);
          });
        }
      }
    );
  }

  public createInstanceFrom(json: any, other?: any): TeachingPeriod {
    return new TeachingPeriod();
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
