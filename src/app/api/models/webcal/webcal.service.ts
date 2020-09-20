import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Webcal } from './webcal';
import { EntityService } from '../entity.service';

interface WebcalUpdateParams {
  enabled?: boolean;
  should_change_guid?: boolean;
  include_start_dates?: boolean;
  reminder?: null | {
    time: number;
    unit: string;
  };
}

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

    // If the API returns null (in the case the user does not have a webcal), return immediately.
    if (!json) return null;

    // Otherwise, create Webcal instance. =
    let webcal = new Webcal();
    webcal.updateFromJson(json);
    return webcal;
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  /**
   * Performs an HTTP PUT request against the /webcal endpoint, with the specified data.
   * `EntityService.put` does not work here because the endpoint returns `null` when the user's webcal is disabled.
   */
  public updateWebcal(data: WebcalUpdateParams): Observable<Webcal | null> {
    return this.put<Webcal>(
      // Send JSON string to skip the `data.toJson` call.
      JSON.stringify({
        webcal: data
      }),
      {
        headers: {
          // Specify JSON content type explicitly because the string used as the body implies text/plain.
          'Content-Type': 'application/json',
        },
      }
    ).pipe(
      // Create an instance of a webcal if one is returned, else null.
      map((webcal) => webcal ? this.createInstanceFrom(webcal) : null)
    );
  }
}
