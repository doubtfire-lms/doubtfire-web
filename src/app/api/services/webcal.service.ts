import { Injectable } from '@angular/core';
import { Webcal } from '../models/webcal/webcal';
import { Entity, EntityService } from 'ngx-entity-service';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class WebcalService extends EntityService<Webcal> {
  protected readonly endpointFormat = 'webcal';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'enabled',
      'id',
      'guid',
      'includeStartDates',
      'userId',
      'reminder',
      'unitExclusions',

      // Only used when updating the webcal.
      'shouldChangeGuid',

      'reminder'
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: any, other?: any): Webcal {
    return new Webcal();
  }
}
