import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {CommunicationCondition} from '../models/communication';

@Injectable()
export class CommunicationConditionService {
  constructor(private httpClient: HttpClient) {}

  public getForRule(unitId: number, ruleId: number): Observable<CommunicationCondition[]> {
    return this.httpClient
      .get<Partial<CommunicationCondition>[]>(this.endpoint(unitId, ruleId))
      .pipe(
        map((conditions) => conditions.map((condition) => new CommunicationCondition(condition))),
      );
  }

  public create(
    unitId: number,
    ruleId: number,
    condition: Partial<CommunicationCondition>,
  ): Observable<CommunicationCondition> {
    return this.httpClient
      .post<Partial<CommunicationCondition>>(this.endpoint(unitId, ruleId), {
        communication_condition: condition,
      })
      .pipe(map((created) => new CommunicationCondition(created)));
  }

  public delete(unitId: number, ruleId: number, conditionId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint(unitId, ruleId)}/${conditionId}`);
  }

  public update(
    unitId: number,
    ruleId: number,
    conditionId: number,
    condition: Partial<CommunicationCondition>,
  ): Observable<CommunicationCondition> {
    return this.httpClient
      .put<Partial<CommunicationCondition>>(`${this.endpoint(unitId, ruleId)}/${conditionId}`, {
        communication_condition: condition,
      })
      .pipe(map((updated) => new CommunicationCondition(updated)));
  }

  private endpoint(unitId: number, ruleId: number): string {
    return `${API_URL}/units/${unitId}/communication_rules/${ruleId}/conditions`;
  }
}
