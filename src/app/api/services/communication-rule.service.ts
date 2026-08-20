import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {
  CommunicationRule,
  CommunicationRuleImportResponse,
  CommunicationRulePreviewResponse,
} from '../models/communication';
import {SidekiqJob} from '../models/sidekiq-job';

@Injectable()
export class CommunicationRuleService {
  constructor(private httpClient: HttpClient) {}

  public getForSet(unitId: number, setId: number): Observable<CommunicationRule[]> {
    return this.httpClient
      .get<Partial<CommunicationRule>[]>(this.setEndpoint(unitId, setId))
      .pipe(map((rules) => rules.map((rule) => new CommunicationRule(rule))));
  }

  public createForSet(
    unitId: number,
    setId: number,
    rule: Pick<CommunicationRule, 'name' | 'operator'>,
  ): Observable<CommunicationRule> {
    return this.httpClient
      .post<Partial<CommunicationRule>>(this.setEndpoint(unitId, setId), {
        communication_rule: rule,
      })
      .pipe(map((created) => new CommunicationRule(created)));
  }

  public updateForUnit(
    unitId: number,
    ruleId: number,
    rule: Partial<
      Pick<CommunicationRule, 'name' | 'operator' | 'position' | 'send_log_to_convenors'>
    >,
  ): Observable<CommunicationRule> {
    return this.httpClient
      .put<Partial<CommunicationRule>>(`${this.endpoint(unitId)}/${ruleId}`, {
        communication_rule: rule,
      })
      .pipe(map((updated) => new CommunicationRule(updated)));
  }

  public deleteForUnit(unitId: number, ruleId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint(unitId)}/${ruleId}`);
  }

  /** Students matched by this rule alone, ignoring the rules ahead of it. */
  public previewForUnit(
    unitId: number,
    ruleId: number,
  ): Observable<CommunicationRulePreviewResponse> {
    return this.httpClient.get<CommunicationRulePreviewResponse>(
      `${this.endpoint(unitId)}/${ruleId}/preview`,
    );
  }

  /** Fetches the portable document for a single rule, for saving to a file. */
  public exportForUnit(unitId: number, ruleId: number): Observable<Record<string, unknown>> {
    return this.httpClient.get<Record<string, unknown>>(
      `${this.endpoint(unitId)}/${ruleId}/export`,
    );
  }

  /** Appends a rule from an exported document to an existing set. */
  public importForSet(
    unitId: number,
    setId: number,
    document: Record<string, unknown>,
    dryRun = false,
  ): Observable<CommunicationRuleImportResponse> {
    return this.httpClient.post<CommunicationRuleImportResponse>(
      `${this.setEndpoint(unitId, setId)}/import`,
      {document, dry_run: dryRun},
    );
  }

  public executeForUnit(unitId: number, ruleId: number): Observable<SidekiqJob> {
    return this.httpClient.post<SidekiqJob>(`${this.endpoint(unitId)}/${ruleId}/execute`, {});
  }

  private endpoint(unitId: number): string {
    return `${API_URL}/units/${unitId}/communication_rules`;
  }

  private setEndpoint(unitId: number, setId: number): string {
    return `${API_URL}/units/${unitId}/communication_sets/${setId}/rules`;
  }
}
