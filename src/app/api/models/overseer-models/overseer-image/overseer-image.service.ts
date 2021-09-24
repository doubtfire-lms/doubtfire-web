import { CachedEntityService } from '../../cached-entity.service';
import { OverseerImage } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';

@Injectable()
export class OverseerImageService extends CachedEntityService<OverseerImage> {
  protected readonly endpointFormat = 'admin/overseer_images/:id:';
  entityName = 'OverseerImage';

  protected createInstanceFrom(json: any, other?: any): OverseerImage {
    const result = new OverseerImage();
    result.updateFromJson(json);
    return result;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
}
