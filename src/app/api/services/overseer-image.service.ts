import { CachedEntityService } from 'ngx-entity-service';
import { OverseerImage } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class OverseerImageService extends CachedEntityService<OverseerImage> {
  protected readonly endpointFormat = 'admin/overseer_images/:id:';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'name',
      'tag',
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public createInstanceFrom(json: object, other?: any): OverseerImage {
    return new OverseerImage();
  }
}
