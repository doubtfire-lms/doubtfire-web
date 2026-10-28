import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Engagement, EngagementComment, UserService} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {MappingFunctions} from './mapping-fn';

@Injectable()
export class EngagementCommentService extends CachedEntityService<EngagementComment> {
  protected readonly endpointFormat =
    'projects/:projectId:/engagements/:engagementId:/comments/:id:';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'comment',
      'replyToId',
      {
        keys: 'user',
        toEntityFn: (data: object, key: string) => {
          return this.userService.cache.getOrCreate(data[key].id, this.userService, data[key]);
        },
      },
      {
        keys: 'createdAt',
        toEntityFn: MappingFunctions.mapDate,
      },
      {
        keys: 'updatedAt',
        toEntityFn: MappingFunctions.mapDate,
      },
    );
  }

  createInstanceFrom(_json: object, other?: Engagement): EngagementComment {
    return new EngagementComment(other);
  }

  addComment(
    engagement: Engagement,
    comment: string,
    replyTo?: EngagementComment,
  ): Observable<EngagementComment> {
    const options: RequestOptions<EngagementComment> = {
      endpointFormat: this.endpointFormat,
      cache: engagement.commentCache,
      constructorParams: engagement,
      body: {
        comment,
        ...(replyTo ? {reply_to_id: replyTo.id} : {}),
      },
    };

    return this.create(
      {
        projectId: engagement.project.id,
        engagementId: engagement.id,
      },
      options,
    ).pipe(
      tap(() => {
        engagement.commentCount++;
        this.updateCommentReplies(engagement.comments);
      }),
    );
  }

  updateComment(comment: EngagementComment, text: string): Observable<EngagementComment> {
    return this.put(
      {
        projectId: comment.engagement.project.id,
        engagementId: comment.engagement.id,
        id: comment.id,
      },
      {
        endpointFormat: this.endpointFormat,
        cache: comment.engagement.commentCache,
        constructorParams: comment.engagement,
        body: {comment: text},
      },
    );
  }

  deleteComment(comment: EngagementComment): Observable<boolean> {
    return this.delete<boolean>(
      {
        projectId: comment.engagement.project.id,
        engagementId: comment.engagement.id,
        id: comment.id,
      },
      {
        endpointFormat: this.endpointFormat,
        cache: comment.engagement.commentCache,
      },
    ).pipe(
      tap(() => {
        comment.engagement.commentCount--;
        this.updateCommentReplies(comment.engagement.comments);
      }),
    );
  }

  updateCommentReplies(comments: readonly EngagementComment[]): void {
    for (const comment of comments) {
      comment.replyTo = comment.replyToId
        ? comments.find((candidate) => candidate.id === comment.replyToId)
        : undefined;
    }
  }
}
