import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {CommunicationAction} from '../models/communication';

@Injectable()
export class CommunicationActionService {
  constructor(private httpClient: HttpClient) {}

  public getForRule(unitId: number, ruleId: number): Observable<CommunicationAction[]> {
    return this.httpClient
      .get<Partial<CommunicationAction>[]>(this.endpoint(unitId, ruleId))
      .pipe(map((actions) => actions.map((action) => new CommunicationAction(action))));
  }

  public create(
    unitId: number,
    ruleId: number,
    action: Partial<CommunicationAction>,
  ): Observable<CommunicationAction> {
    return this.httpClient
      .post<Partial<CommunicationAction>>(this.endpoint(unitId, ruleId), {
        communication_action: action,
      })
      .pipe(map((created) => new CommunicationAction(created)));
  }

  public delete(unitId: number, ruleId: number, actionId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint(unitId, ruleId)}/${actionId}`);
  }

  public update(
    unitId: number,
    ruleId: number,
    actionId: number,
    action: Partial<CommunicationAction>,
  ): Observable<CommunicationAction> {
    return this.httpClient
      .put<Partial<CommunicationAction>>(`${this.endpoint(unitId, ruleId)}/${actionId}`, {
        communication_action: action,
      })
      .pipe(map((updated) => new CommunicationAction(updated)));
  }

  private endpoint(unitId: number, ruleId: number): string {
    return `${API_URL}/units/${unitId}/communication_rules/${ruleId}/actions`;
  }
}
