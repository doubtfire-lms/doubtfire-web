import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  Engagement,
  EngagementCommentService,
  Project,
  UserService,
} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {MappingFunctions} from './mapping-fn';

export interface EngagementData {
  engagementType: string;
  note: string;
  occurredAt: Date;
  evidenceUrl?: string;
  attachment?: File;
}

export interface EngagementUpdate extends Partial<EngagementData> {
  removeEvidence?: boolean;
}

@Injectable()
export class EngagementService extends CachedEntityService<Engagement> {
  protected readonly endpointFormat = 'projects/:projectId:/engagements/:id:';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private engagementCommentService: EngagementCommentService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'engagementType',
      'note',
      'evidenceUrl',
      'contentType',
      'hasAttachment',
      'attachmentFileName',
      'commentCount',
      {
        keys: 'user',
        toEntityFn: (data: object, key: string) => {
          return this.userService.cache.getOrCreate(data[key].id, this.userService, data[key]);
        },
      },
      {
        keys: 'occurredAt',
        toEntityFn: MappingFunctions.mapDate,
      },
      {
        keys: 'createdAt',
        toEntityFn: MappingFunctions.mapDate,
      },
      {
        keys: 'updatedAt',
        toEntityFn: MappingFunctions.mapDate,
      },
      {
        keys: 'comments',
        toEntityOp: (data: object, key: string, engagement: Engagement) => {
          engagement.commentCache.clear();
          data[key]?.forEach((comment) => {
            engagement.commentCache.getOrCreate(
              comment.id,
              this.engagementCommentService,
              comment,
              {constructorParams: engagement},
            );
          });
          this.engagementCommentService.updateCommentReplies(engagement.comments);
        },
      },
    );
  }

  createInstanceFrom(_json: object, other?: Project): Engagement {
    return new Engagement(other);
  }

  loadEngagements(project: Project, refresh: boolean = false): Observable<Engagement[]> {
    const options: RequestOptions<Engagement> = {
      endpointFormat: this.endpointFormat,
      cache: project.engagementCache,
      sourceCache: project.engagementCache,
      cacheBehaviourOnGet: 'cacheQuery',
      constructorParams: project,
    };
    const pathIds = {projectId: project.id};

    return refresh ? this.fetchAll(pathIds, options) : this.query(pathIds, options);
  }

  loadEngagement(engagement: Engagement): Observable<Engagement> {
    return this.fetch(
      {
        projectId: engagement.project.id,
        id: engagement.id,
      },
      {
        endpointFormat: this.endpointFormat,
        cache: engagement.project.engagementCache,
        constructorParams: engagement.project,
      },
    );
  }

  createEngagement(project: Project, data: EngagementData): Observable<Engagement> {
    return this.create(
      {projectId: project.id},
      {
        endpointFormat: this.endpointFormat,
        cache: project.engagementCache,
        constructorParams: project,
        body: this.toFormData(data),
      },
    );
  }

  updateEngagement(engagement: Engagement, data: EngagementUpdate): Observable<Engagement> {
    return this.put(
      {
        projectId: engagement.project.id,
        id: engagement.id,
      },
      {
        endpointFormat: this.endpointFormat,
        cache: engagement.project.engagementCache,
        constructorParams: engagement.project,
        body: this.toFormData(data),
      },
    );
  }

  deleteEngagement(engagement: Engagement): Observable<boolean> {
    return this.delete(
      {
        projectId: engagement.project.id,
        id: engagement.id,
      },
      {
        endpointFormat: this.endpointFormat,
        cache: engagement.project.engagementCache,
      },
    );
  }

  private toFormData(data: EngagementUpdate): FormData {
    const body = new FormData();

    if (data.engagementType !== undefined) {
      body.append('engagement_type', data.engagementType);
    }
    if (data.note !== undefined) {
      body.append('note', data.note);
    }
    if (data.occurredAt !== undefined) {
      body.append('occurred_at', data.occurredAt.toISOString());
    }
    if (data.evidenceUrl !== undefined) {
      body.append('evidence_url', data.evidenceUrl);
    }
    if (data.attachment !== undefined) {
      body.append('attachment', data.attachment);
    }
    if (data.removeEvidence !== undefined) {
      body.append('remove_evidence', String(data.removeEvidence));
    }

    return body;
  }
}
