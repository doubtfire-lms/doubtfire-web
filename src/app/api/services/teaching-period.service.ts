import { HttpClient } from '@angular/common/http';
import { CachedEntityService, Entity } from 'ngx-entity-service';
import { TeachingPeriod, TeachingPeriodBreakService, UnitService } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import API_URL from 'src/app/config/constants/apiURL';
import { AppInjector } from 'src/app/app-injector';
import { MappingFunctions } from './mapping-fn';

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
      {
        keys: 'startDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson
      },
      {
        keys: 'endDate',
        toEntityFn: MappingFunctions.mapDateToDay,
        toJsonFn: MappingFunctions.mapDayToJson
      },
      'activeUntil',
      'active',
      {
        keys: 'breaks',
        toEntityOp: (data, key, entity) => {
          data['breaks']?.forEach(breakJson => {
            const teachingPeriod = entity as TeachingPeriod;
            const breakEntity = this.teachingPeriodBreakService.buildInstance(breakJson);
            teachingPeriod.breaksCache.add(breakEntity);
          });
        }
      },
      {
        keys: 'units',
        toEntityOp: (data, key, entity) => {
          data[key]?.forEach(unitJson => {
            const unitService: UnitService = AppInjector.get(UnitService);
            const unit = unitService.cache.getOrCreate(
              unitJson['id'],
              unitService,
              unitJson
            );
            entity.unitsCache.add(unit);
          });
        }
      }
    );

    this.mapping.mapAllKeysToJsonExcept('id', 'unit', 'breaks');
    this.cacheBehaviourOnGet = 'cacheQuery';
  }

  public createInstanceFrom(json: any, other?: any): TeachingPeriod {
    return new TeachingPeriod();
  }
}
