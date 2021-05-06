import { TaskComment } from 'src/app/api/models/doubtfire-model';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CachedEntityService } from '../cached-entity.service';
import { HttpOptions } from '../entity.service';
import { DiscussionComment } from './discussion-comment';
import { ExtensionComment } from './extension-comment';

@Injectable()
export class TaskCommentService extends CachedEntityService<TaskComment> {
  public readonly commentAdded$: EventEmitter<TaskComment> = new EventEmitter();

  private readonly commentEndpointFormat = 'projects/:projectId:/task_def_id/:taskDefinitionId:/comments/:id:';
  private readonly discussionEndpointFormat = 'projects/:projectId:/task_def_id/:taskDefinitionId:/discussion_comments';
  private readonly extensionGrantEndpointFormat =
    'projects/:projectId:/task_def_id/:taskDefinitionId:/assess_extension/:id:';
  private readonly requestExtensionEndpointFormat =
    'projects/:projectId:/task_def_id/:taskDefinitionId:/request_extension';

  protected readonly endpointFormat = this.commentEndpointFormat;
  entityName = 'TaskComment';

  /**
   * Create a Task Comment - use the type to determine the exact object type to return.
   */
  protected createInstanceFrom(json: any, other?: any): TaskComment {
    switch (json.type) {
      case 'discussion':
        return new DiscussionComment(json, other);
      case 'extension':
        return new ExtensionComment(json, other);
      default:
        return new TaskComment(json, other);
    }
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  /**
   * Query for task comments, and update unread message count.
   *
   * @param pathIds The details needed to query the API
   * @param other Contains the related Tasks used to construct the TaskComments
   * @param options
   */
  public query(pathIds?: object, other?: object, options?: HttpOptions): Observable<TaskComment[]> {
    return super.query(pathIds, other, options).pipe(
      tap((result) => {
        // Access the task and set the number of new comments to 0 - they are now read on the server
        const task = other as any;
        task.num_new_comments = 0;
      })
    );
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

  public assessExtension(extension: ExtensionComment): Observable<TaskComment> {
    const opts: HttpOptions = {
      alternateEndpointFormat: this.extensionGrantEndpointFormat,
    };

    return super.update(
      {
        id: extension.id,
        projectId: extension.project.project_id,
        taskDefinitionId: extension.task.task_definition_id,
      },
      extension,
      opts
    );
  }

  public requestExtension(reason: string, weeksRequested: number, task: any): Observable<TaskComment> {
    const opts: HttpOptions = {
      alternateEndpointFormat: this.requestExtensionEndpointFormat,
    };
    return super.create(
      {
        projectId: task.project().project_id,
        taskDefinitionId: task.task_definition_id,
      },
      {
        comment: reason,
        weeks_requested: weeksRequested,
      },
      task,
      opts
    );
  }
}
