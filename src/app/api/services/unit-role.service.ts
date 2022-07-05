import { TeachingPeriodService, UnitRole, UnitService, UserService } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService } from 'ngx-entity-service';
import { Inject, Injectable } from '@angular/core';
import { analyticsService } from 'src/app/ajs-upgraded-providers';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class UnitRoleService extends CachedEntityService<UnitRole> {
  protected readonly endpointFormat = 'unit_roles/:id:';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private unitService: UnitService,
    private teachingPeriodService: TeachingPeriodService,
    @Inject(analyticsService) private AnalyticsService: any
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      {
        keys: 'unit',
        toEntityFn: (data, key, entity) => {
          const unitData = data['unit'];
          return this.unitService.cache.getOrCreate(unitData.id, unitService, unitData);
        },
        toJsonFn: (entity: UnitRole, key: string) => {
          return entity.unit?.id;
        }
      },
      {
        keys: 'user',
        toEntityFn: (data: object, key: string, entity: UnitRole, params?: any) => {
          return this.userService.cache.getOrCreate(data['user']['id'], userService, data['user']);
        },
      },
      'role',
      'roleId',
      {
        keys: 'userId',
        toJsonFn: (entity: UnitRole, key: string) => {
          return entity.user?.id;
        }
      },
      {
        keys: 'unitId',
        toJsonFn: (entity: UnitRole, key: string) => {
          return entity.unit?.id;
        }
      },
    );

    this.mapping.addJsonKey('roleId', 'userId', 'unitId', 'role');
  }

  public createInstanceFrom(json: any, other?: any): UnitRole {
    return new UnitRole();
  }

}
