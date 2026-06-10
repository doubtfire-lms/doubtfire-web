import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {Observable, tap} from 'rxjs';
import {Engagement, EngagementComment, UserService} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
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

  addComment(engagement: Engagement, comment: string): Observable<EngagementComment> {
    const options: RequestOptions<EngagementComment> = {
      endpointFormat: this.endpointFormat,
      cache: engagement.commentCache,
      constructorParams: engagement,
      body: {comment},
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
      }),
    );
  }
}
