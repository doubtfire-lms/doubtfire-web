import { Injectable } from '@angular/core';
import { EntityService } from 'ngx-entity-service';
import API_URL from 'src/app/config/constants/apiURL';
import { HttpClient } from '@angular/common/http';
import { D2lAssessmentMapping } from './d2l_assessment_mapping';
import { Unit } from '../doubtfire-model';

@Injectable()
export class D2lAssessmentMappingService extends EntityService<D2lAssessmentMapping> {
  protected readonly endpointFormat = 'units/:unitId:/d2l/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'orgUnitId', 'gradeObjectId');

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(_json: object, other: Unit): D2lAssessmentMapping {
    return new D2lAssessmentMapping(other);
  }
}
