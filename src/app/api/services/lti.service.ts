import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import LTI_API_URL from 'src/app/config/constants/ltiApiUrl';

@Injectable()
export class LtiService {
  constructor(private httpClient: HttpClient) {}

  // Sends a deeplink request to the LTI.js API (not the Ruby API).
  public sendDeeplinkRequest(data: {unit_id: string}): Observable<string> {
    return this.httpClient.post<string>(`${LTI_API_URL}/deeplink`, data);
  }
}
