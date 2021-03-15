import { TaskComment } from 'src/app/api/models/doubtfire-model';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CachedEntityService } from '../cached-entity.service';
import { HttpOptions } from '../entity.service';
import { DiscussionComment } from './discussion-comment';

@Injectable()
export class TaskCommentService extends CachedEntityService<TaskComment> {
  public readonly commentAdded$: EventEmitter<TaskComment> = new EventEmitter();

  private readonly commentEndpointFormat = 'projects/:projectId:/task_def_id/:taskDefinitionId:/comments/:id:';
  private readonly discussionEndpointFormat =
    '/projects/:projectId:/task_def_id/:taskDefinitionId:/discussion_comments';

  protected readonly endpointFormat = this.commentEndpointFormat;
  entityName = 'TaskComment';

  /**
   * Create a Task Comment - use the type to determine the exact object type to return.
   */
  protected createInstanceFrom(json: any, other?: any): TaskComment {
    if (json.type === 'discussion') {
      return new DiscussionComment(json, other);
    } else {
      return new TaskComment(json, other);
    }
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  public addComment(
    task: any,
    data: string | File | Blob,
    commentType: string,
    originalComment?: TaskComment,
    prompts?: Blob[]
  ): Observable<TaskComment> {
    const pathId: {} = {
      projectId: task.project().project_id,
      taskDefinitionId: task.task_definition_id,
    };

    const body: FormData = new FormData();
    if (originalComment) {
      body.append('reply_to_id', originalComment?.id.toString());
    }

    const opts: HttpOptions = { alternateEndpointFormat: this.commentEndpointFormat };

    // Based on the comment type - add to the body and configure the end point
    if (commentType === 'text') {
      body.append('comment', data);
    } else if (commentType === 'discussion') {
      opts.alternateEndpointFormat = this.discussionEndpointFormat;
      for (const prompt of prompts) {
        body.append('attachments[]', prompt);
      }
    } else {
      body.append('attachment', data);
    }

    this.cacheSource = task.commentCache;
    const self = this;
    return this.create(pathId, body, task, opts).pipe(
      tap((tc: TaskComment) => {
        task.comments.push(tc);
        task.refreshCommentData();
        self.commentAdded$.emit(tc);
      })
    );
  }
}
