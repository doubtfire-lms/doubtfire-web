import {EntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MoodleIntegration} from 'src/app/api/models/moodle-integration';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import API_URL from 'src/app/config/constants/apiUrl';

@Injectable()
export class MoodleIntegrationService extends EntityService<MoodleIntegration> {
  protected readonly endpointFormat = 'units/:unitId:/moodle';

  constructor(private http: HttpClient) {
    super(http, API_URL);

    this.mapping.addKeys(
      'id',
      'courseId',
      'assignmentId',
      'assignmentName',
      'fetchExtensions',
      'apiKeyConfigured',
    );
    this.mapping.mapAllKeysToJsonExcept('id', 'apiKeyConfigured');
    this.mapping.onlyMapChanges = false;
  }

  public createInstanceFrom(_json: object, unit: Unit): MoodleIntegration {
    return new MoodleIntegration(unit);
  }

  public getSettings(unit: Unit): Observable<MoodleIntegration> {
    return this.get({unitId: unit.id}, {constructorParams: unit});
  }

  public updateSettings(
    integration: MoodleIntegration,
    apiKey: string,
  ): Observable<MoodleIntegration> {
    const body = integration.toJson(this.mapping) as Record<string, unknown>;
    body['assignment_id'] = integration.fetchExtensions ? integration.assignmentId : null;
    if (apiKey) {
      body['api_key'] = apiKey;
    }

    return this.put<object>({unitId: integration.unit.id}, {body}).pipe(
      map((response) =>
        this.buildInstance(response, {
          constructorParams: integration.unit,
          entity: integration,
        }),
      ),
    );
  }

  public testConnection(unitId: number): Observable<SidekiqJob> {
    return this.http.post<SidekiqJob>(`${API_URL}/units/${unitId}/moodle/test`, {});
  }

  public importStudents(unitId: number, previewOnly: boolean): Observable<SidekiqJob> {
    return this.http.post<SidekiqJob>(`${API_URL}/units/${unitId}/moodle/import_students`, {
      preview_only: previewOnly,
    });
  }

  public importExtensions(unitId: number, previewOnly: boolean): Observable<SidekiqJob> {
    return this.http.post<SidekiqJob>(`${API_URL}/units/${unitId}/moodle/import_extensions`, {
      preview_only: previewOnly,
    });
  }
}
