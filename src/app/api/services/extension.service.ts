import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/api/models/doubtfire-model';

interface GrantExtensionPayload {
  student_ids: number[];
  task_definition_id: number;
  weeks_requested: number;
  comment: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExtensionService {
  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  grantExtension(unitId: number, payload: GrantExtensionPayload): Observable<any> {
    const authToken = this.userService.currentUser?.authenticationToken ?? '';
    const username = this.userService.currentUser?.username ?? '';

    const headers = new HttpHeaders({
      'Auth-Token': authToken,
      'Username': username
    });

    return this.http.post(
      `/api/units/${unitId}/staff-grant-extension`,
      payload,
      { headers }
    );
  }
}
