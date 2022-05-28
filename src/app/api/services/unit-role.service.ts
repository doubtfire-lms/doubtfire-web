import { TeachingPeriodService, UnitRole, UnitService, UserService } from 'src/app/api/models/doubtfire-model';
import { CachedEntityService } from 'ngx-entity-service';
import { Inject, Injectable } from '@angular/core';
import { currentUser, auth, analyticsService } from 'src/app/ajs-upgraded-providers';
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
    @Inject(currentUser) private CurrentUser: any,
    @Inject(auth) private Auth: any,
    @Inject(analyticsService) private AnalyticsService: any
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      {
        keys: ['unit', 'unit_id'],
        toEntityFn: (data, key, entity) => {
          return this.unitService.cache.getOrCreate(
            data['unit_id'],
            unitService,
            {
              id: data['unit_id'],
              active: data['active'],
              code: data['unit_code'],
              name: data['unit_name'],
              start_date: data['start_date'],
              end_date: data['end_date'],
              teaching_period_id: data['teaching_period_id']
            }
          );
        }
      },
      {
        keys: ['user','user_id'],
        toEntityFn: (data: object, key: string, entity: UnitRole, params?: any) => {
          return this.userService.cache.getOrCreate(data['user_id'], userService, {
            id: data['user_id'],
            email: data['email'],
            name: data['name'],
          });
        },
        toJsonFn: (entity: UnitRole, key: string) => {
          return entity.user?.id;
        }
      },
      'role'
    );
  }

  public createInstanceFrom(json: any, other?: any): UnitRole {
    return new UnitRole();
  }

}
