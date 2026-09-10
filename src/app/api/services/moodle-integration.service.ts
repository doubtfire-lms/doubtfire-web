import {EntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  MoodleGroup,
  MoodleGroupMapping,
  MoodleGroupMappingPrefillResult,
  MoodleIntegration,
} from 'src/app/api/models/moodle-integration';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import API_URL from 'src/app/config/constants/apiUrl';
import {MoodleGroupMappingService} from './moodle-group-mapping.service';

@Injectable()
export class MoodleIntegrationService extends EntityService<MoodleIntegration> {
  protected readonly endpointFormat = 'units/:unitId:/moodle';

  constructor(
    private http: HttpClient,
    private moodleGroupMappingService: MoodleGroupMappingService,
  ) {
    super(http, API_URL);

    this.mapping.addKeys(
      'id',
      'courseId',
      'assignmentId',
      'assignmentName',
      'fetchExtensions',
      'autoSyncStudents',
      'autoSyncExtensions',
      'groupMappingEnabled',
      'validated',
      'validatedAt',
      {
        keys: 'groupMappings',
        toEntityFn: (data: object, key: string) => {
          return (data[key] ?? []).map((mapping: Record<string, unknown>) =>
            this.moodleGroupMappingService.cache.getOrCreate(
              mapping['id'] as number,
              this.moodleGroupMappingService,
              mapping,
            ),
          );
        },
        toJsonFn: (integration: MoodleIntegration) => {
          return integration.groupMappings.map((mapping) =>
            mapping.toJson(this.moodleGroupMappingService.mapping),
          );
        },
      },
      'apiKeyConfigured',
    );
    this.mapping.mapAllKeysToJsonExcept('id', 'apiKeyConfigured', 'validated', 'validatedAt');
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

  public validateIntegration(unitId: number): Observable<SidekiqJob> {
    return this.http.post<SidekiqJob>(`${API_URL}/units/${unitId}/moodle/validate`, {});
  }

  public prefillGroupMappings(
    unitId: number,
    groups: MoodleGroup[],
  ): Observable<MoodleGroupMappingPrefillResult> {
    return this.http
      .post<{group_mappings: Record<string, unknown>[]}>(
        `${API_URL}/units/${unitId}/moodle/prefill_group_mappings`,
        {groups},
      )
      .pipe(
        map((response: unknown) => {
          const data = response as {group_mappings: Record<string, unknown>[]};
          return {
            groupMappings: data.group_mappings.map((item) => {
              const mapping = new MoodleGroupMapping();
              mapping.moodleGroupId = item['moodle_group_id'] as number;
              mapping.moodleGroupName = item['moodle_group_name'] as string;
              mapping.targetType = item['target_type'] as MoodleGroupMapping['targetType'];
              mapping.groupSetId = (item['group_set_id'] as number) ?? null;
              mapping.groupId = (item['group_id'] as number) ?? null;
              mapping.campusId = (item['campus_id'] as number) ?? null;
              mapping.tutorialStreamId = (item['tutorial_stream_id'] as number) ?? null;
              mapping.tutorialId = (item['tutorial_id'] as number) ?? null;
              const draft = item['tutorial_draft'] as Record<string, unknown> | undefined;
              if (draft) {
                mapping.tutorialDraft = {
                  abbreviation: draft['abbreviation'] as string,
                  campusId: (draft['campus_id'] as number) ?? null,
                  tutorialStreamId: (draft['tutorial_stream_id'] as number) ?? null,
                  meetingLocation: draft['meeting_location'] as string,
                  meetingDay: draft['meeting_day'] as string,
                  meetingTime: draft['meeting_time'] as string,
                  capacity: (draft['capacity'] as number) ?? null,
                  tutorId: (draft['tutor_id'] as number) ?? null,
                };
              }
              return mapping;
            }),
          };
        }),
      );
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
