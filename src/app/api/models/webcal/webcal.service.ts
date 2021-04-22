import { Injectable } from '@angular/core';
import { Webcal } from './webcal';
import { EntityService } from '../entity.service';

@Injectable()
export class WebcalService extends EntityService<Webcal> {
  protected readonly endpointFormat = 'webcal';
  entityName = 'Webcal';

  protected createInstanceFrom(json: any, other?: any): Webcal {
    const webcal = new Webcal();
    webcal.updateFromJson(json);
    return webcal;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
