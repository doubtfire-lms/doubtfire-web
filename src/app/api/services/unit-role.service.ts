import {CachedEntityService} from 'ngx-entity-service';
import {
  TeachingPeriodService,
  Unit,
  UnitRole,
  UnitService,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class UnitRoleService extends CachedEntityService<UnitRole> {
  protected readonly endpointFormat = 'unit_roles/:id:';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private unitService: UnitService,
    private teachingPeriodService: TeachingPeriodService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      {
        keys: 'unit',
        toEntityFn: (data, key, entity) => {
          const unitData = data['unit'];
          const result: Unit = this.unitService.cache.getOrCreate(
            unitData.id,
            unitService,
            unitData,
          );
          result.updateFromJson(unitData, this.unitService.mapping);
          return result;
        },
        toJsonFn: (entity: UnitRole, key: string) => {
          return entity.unit?.id;
        },
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
        },
      },
      {
        keys: 'unitId',
        toJsonFn: (entity: UnitRole, key: string) => {
          return entity.unit?.id;
        },
      },
      'observerOnly',
      'mentorId',
      'tutorNoteCount',
      'canMarkOverflowTasks',
    );

    this.mapping.addJsonKey(
      'roleId',
      'userId',
      'unitId',
      'role',
      'observerOnly',
      'mentorId',
      'canMarkOverflowTasks',
    );
  }

  public createInstanceFrom(json: any, other?: any): UnitRole {
    return new UnitRole();
  }
}
