import { CachedEntityService } from 'ngx-entity-service';
import { Observable, switchMap } from 'rxjs';
import { OverseerImage } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable()
export class OverseerImageService extends CachedEntityService<OverseerImage> {
  protected readonly endpointFormat = 'admin/overseer_images/:id:';
  protected readonly pullImageEndpointFormat = 'admin/overseer_images/:id:/pull_image';

  constructor(httpClient: HttpClient) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'name',
      'tag',
      'pulledImageText',
      'pulledImageStatus',
      'lastPulledDate'
    );

    this.mapping.mapAllKeysToJsonExcept('id');
  }

  public pullDockerImage(image: OverseerImage): Observable<OverseerImage> {
    return super.put(image, {
      endpointFormat: this.pullImageEndpointFormat
    }).pipe(
      switchMap(response => {
        return super.update(image);
      })
    )
  }

  public createInstanceFrom(json: object, other?: any): OverseerImage {
    return new OverseerImage();
  }
}
