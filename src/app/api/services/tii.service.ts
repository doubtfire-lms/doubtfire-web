import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import API_URL from 'src/app/config/constants/apiURL';

@Injectable({
  providedIn: 'root',
})
export class TiiService {
  constructor(private httpClient: HttpClient) {}

  public getTiiEula(): Observable<string> {
    return this.httpClient.get<string>(`${API_URL}/tii_eula`);
  }
}
