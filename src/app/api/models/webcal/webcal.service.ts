import { Webcal } from './webcal';
import { EntityService } from '../entity.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class WebcalService extends EntityService<Webcal> {

  entityName: string = 'Webcal';
  protected readonly endpointFormat = 'webcal';

  constructor(
    httpClient: HttpClient
  ) {
    super(httpClient);
  }

  protected createInstanceFrom(json: any, other?: any): Webcal {
    let webcal = new Webcal();
    webcal.updateFromJson(json);
    return webcal;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
