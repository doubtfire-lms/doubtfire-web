import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, map} from 'rxjs';
import API_URL from 'src/app/config/constants/apiUrl';
import {
  CommunicationSet,
  CommunicationSetPreviewResponse,
  CommunicationSetSchedule,
} from '../models/communication';
import {SidekiqJob} from '../models/sidekiq-job';

@Injectable()
export class CommunicationSetService {
  constructor(private httpClient: HttpClient) {}

  public getForUnit(unitId: number): Observable<CommunicationSet[]> {
    return this.httpClient
      .get<Partial<CommunicationSet>[]>(this.endpoint(unitId))
      .pipe(map((sets) => sets.map((set) => new CommunicationSet(set))));
  }

  public createForUnit(
    unitId: number,
    set: Pick<CommunicationSet, 'name'> & Partial<Pick<CommunicationSet, 'active'>>,
  ): Observable<CommunicationSet> {
    return this.httpClient
      .post<Partial<CommunicationSet>>(this.endpoint(unitId), {
        communication_set: set,
      })
      .pipe(map((created) => new CommunicationSet(created)));
  }

  public deleteForUnit(unitId: number, setId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint(unitId)}/${setId}`);
  }

  public updateForUnit(
    unitId: number,
    setId: number,
    set: Partial<Pick<CommunicationSet, 'name' | 'active'>> & {
      schedules?: Partial<CommunicationSetSchedule>[];
    },
  ): Observable<CommunicationSet> {
    return this.httpClient
      .put<Partial<CommunicationSet>>(`${this.endpoint(unitId)}/${setId}`, {
        communication_set: set,
      })
      .pipe(map((updated) => new CommunicationSet(updated)));
  }

  public getForUnitById(
    unitId: number,
    setId: number,
  ): Observable<CommunicationSetPreviewResponse> {
    return this.httpClient.get<CommunicationSetPreviewResponse>(
      `${this.endpoint(unitId)}/${setId}`,
    );
  }

  public executeForUnit(unitId: number, setId: number): Observable<SidekiqJob> {
    return this.httpClient.post<SidekiqJob>(`${this.endpoint(unitId)}/${setId}/execute`, {});
  }

  private endpoint(unitId: number): string {
    return `${API_URL}/units/${unitId}/communication_sets`;
  }
}
