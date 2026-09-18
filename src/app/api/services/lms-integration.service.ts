import {EntityService} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  LmsCourseData,
  LmsGradeLineItemStatus,
  LmsGroup,
  LmsGroupMapping,
  LmsGroupMappingPrefillResult,
  LmsIntegration,
  LmsIntegrationValidationResult,
  LmsLink,
  LmsOverview,
} from 'src/app/api/models/lms-integration';
import {SidekiqJob} from 'src/app/api/models/sidekiq-job';
import {Unit} from 'src/app/api/models/unit';
import API_URL from 'src/app/config/constants/apiUrl';
import {LmsGroupMappingService} from './lms-group-mapping.service';

@Injectable()
export class LmsIntegrationService extends EntityService<LmsIntegration> {
  protected readonly endpointFormat = 'units/:unitId:/lms';

  constructor(
    private http: HttpClient,
    private lmsGroupMappingService: LmsGroupMappingService,
  ) {
    super(http, API_URL);

    this.mapping.addKeys(
      'id',
      'source',
      'assignmentId',
      'assignmentName',
      'fetchExtensions',
      'autoSyncStudents',
      'withdrawMissingStudents',
      'autoSyncExtensions',
      'groupMappingEnabled',
      'validated',
      'validatedAt',
      {
        keys: 'groupMappings',
        toEntityFn: (data: object, key: string) => {
          return (data[key] ?? []).map((mapping: Record<string, unknown>) =>
            this.lmsGroupMappingService.cache.getOrCreate(
              mapping['id'] as number,
              this.lmsGroupMappingService,
              mapping,
            ),
          );
        },
        toJsonFn: (integration: LmsIntegration) => {
          return integration.groupMappings.map((mapping) =>
            mapping.toJson(this.lmsGroupMappingService.mapping),
          );
        },
      },
    );
    this.mapping.mapAllKeysToJsonExcept('id', 'source', 'validated', 'validatedAt');
    this.mapping.onlyMapChanges = false;
  }

  public createInstanceFrom(_json: object, unit: Unit): LmsIntegration {
    return new LmsIntegration(unit);
  }

  private get url(): string {
    return `${API_URL}/units`;
  }

  public getOverview(unit: Unit): Observable<LmsOverview> {
    return this.http
      .get<{link: LmsLink | null; link_error: string | null; integration: object}>(
        `${this.url}/${unit.id}/lms`,
      )
      .pipe(
        map((response) => ({
          link: response.link,
          linkError: response.link_error,
          integration: this.buildInstance(response.integration, {constructorParams: unit}),
        })),
      );
  }

  public updateSettings(integration: LmsIntegration): Observable<LmsIntegration> {
    const body = integration.toJson(this.mapping) as Record<string, unknown>;
    body['assignment_id'] = integration.fetchExtensions ? integration.assignmentId : null;

    return this.put<object>({unitId: integration.unit.id}, {body}).pipe(
      map((response) =>
        this.buildInstance(response, {
          constructorParams: integration.unit,
          entity: integration,
        }),
      ),
    );
  }

  public unlink(unitId: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${unitId}/lms/link`);
  }

  public getCourseData(unitId: number): Observable<LmsCourseData> {
    return this.http
      .get<{
        course: {
          context_id: string;
          label: string | null;
          title: string | null;
          start_date: number | null;
          end_date: number | null;
        };
        groups: LmsGroup[];
        assignments: Array<{id: number; name: string; due_date: number}>;
      }>(`${this.url}/${unitId}/lms/course_data`)
      .pipe(
        map((response) => ({
          course: {
            contextId: response.course.context_id,
            label: response.course.label,
            title: response.course.title,
            startDate: response.course.start_date,
            endDate: response.course.end_date,
          },
          groups: response.groups,
          assignments: response.assignments.map((assignment) => ({
            id: assignment.id,
            name: assignment.name,
            dueDate: assignment.due_date,
          })),
        })),
      );
  }

  public validateIntegration(unitId: number): Observable<LmsIntegrationValidationResult> {
    return this.http.post<LmsIntegrationValidationResult>(`${this.url}/${unitId}/lms/validate`, {});
  }

  public prefillGroupMappings(
    unitId: number,
    groups: LmsGroup[],
  ): Observable<LmsGroupMappingPrefillResult> {
    return this.http
      .post<{group_mappings: Record<string, unknown>[]}>(
        `${this.url}/${unitId}/lms/prefill_group_mappings`,
        {groups},
      )
      .pipe(
        map((data) => ({
          groupMappings: data.group_mappings.map((item) => {
            const mapping = new LmsGroupMapping();
            mapping.lmsGroupId = item['lms_group_id'] as number;
            mapping.lmsGroupName = item['lms_group_name'] as string;
            mapping.targetType = item['target_type'] as LmsGroupMapping['targetType'];
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
        })),
      );
  }

  public importStudents(
    unitId: number,
    previewOnly: boolean,
    withdrawMissing: boolean,
  ): Observable<SidekiqJob> {
    return this.http.post<SidekiqJob>(`${this.url}/${unitId}/lms/import_students`, {
      preview_only: previewOnly,
      withdraw_missing: withdrawMissing,
    });
  }

  public importExtensions(unitId: number, previewOnly: boolean): Observable<SidekiqJob> {
    return this.http.post<SidekiqJob>(`${this.url}/${unitId}/lms/import_extensions`, {
      preview_only: previewOnly,
    });
  }

  public getGradeLineItem(unitId: number): Observable<LmsGradeLineItemStatus> {
    return this.http.get<LmsGradeLineItemStatus>(`${this.url}/${unitId}/lms/grade_line_item`);
  }

  public retryGradeLineItem(unitId: number): Observable<LmsGradeLineItemStatus> {
    return this.http.post<LmsGradeLineItemStatus>(`${this.url}/${unitId}/lms/grade_line_item`, {});
  }

  public syncGrades(unitId: number): Observable<SidekiqJob> {
    return this.http.post<SidekiqJob>(`${this.url}/${unitId}/lms/sync_grades`, {});
  }
}
