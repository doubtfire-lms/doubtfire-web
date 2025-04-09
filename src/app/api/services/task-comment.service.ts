import { ScormComment, Task, TaskComment, TestAttemptService, UserService } from 'src/app/api/models/doubtfire-model';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CachedEntityService } from 'ngx-entity-service';
import { DiscussionComment } from '../models/task-comment/discussion-comment';
import { ExtensionComment } from '../models/task-comment/extension-comment';
import { RequestOptions } from 'ngx-entity-service/lib/request-options';
import { HttpClient } from '@angular/common/http';
import API_URL from 'src/app/config/constants/apiURL';
import { EmojiService } from 'src/app/common/services/emoji.service';
import { MappingFunctions } from './mapping-fn';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader.service';
import { ScormExtensionComment } from '../models/task-comment/scorm-extension-comment';

@Injectable()
export class TaskCommentService extends CachedEntityService<TaskComment> {
  public readonly commentAdded$: EventEmitter<TaskComment> = new EventEmitter();

  private readonly commentEndpointFormat = 'projects/:projectId:/task_def_id/:taskDefinitionId:/comments/:id:';
  private readonly discussionEndpointFormat = 'projects/:projectId:/task_def_id/:taskDefinitionId:/discussion_comments';
  private readonly extensionGrantEndpointFormat =
    'projects/:projectId:/task_def_id/:taskDefinitionId:/assess_extension/:id:';
  private readonly requestExtensionEndpointFormat =
    'projects/:projectId:/task_def_id/:taskDefinitionId:/request_extension';
  private readonly scormExtensionGrantEndpointFormat =
    'projects/:projectId:/task_def_id/:taskDefinitionId:/assess_scorm_extension/:id:';
  private readonly scormRequestExtensionEndpointFormat =
    'projects/:projectId:/task_def_id/:taskDefinitionId:/request_scorm_extension';
  private readonly discussionCommentReplyEndpointFormat = "/projects/:project_id:/task_def_id/:task_definition_id:/comments/:task_comment_id:/discussion_comment/reply";
  private readonly getDiscussionCommentPromptEndpointFormat = "/projects/:project_id:/task_def_id/:task_definition_id:/comments/:task_comment_id:/discussion_comment/prompt_number/:prompt_number:";


  protected readonly endpointFormat = this.commentEndpointFormat;

  constructor(
    httpClient: HttpClient,
    private emojiService: EmojiService,
    private userService: UserService,
    private downloader: FileDownloaderService,
    private testAttemptService: TestAttemptService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      {
        keys: 'author',
        toEntityFn: (data: object, key: string, comment: TaskComment) => {
          const user = this.userService.cache.getOrCreate(data[key]?.id, userService, data[key]);
          comment.initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
          return user;
        }
      },
      {
        keys: 'recipient',
        toEntityFn: (data: object, key: string, comment: TaskComment) => {
          return this.userService.cache.getOrCreate(data[key]?.id, userService, data[key]);
        }
      },
      'recipientReadTime',
      'replyToId',
      'isNew',
      {
        keys: ['text', 'comment'],
        toEntityFn: (data, key, entity) => {
          return this.emojiService.colonsToNative(data['comment']);
        }
      },
      {
        keys: 'createdAt',
        toEntityFn: MappingFunctions.mapDate
      },
      {
        keys: 'type',
        toEntityOp: (data: object, key: string, comment:TaskComment) => {
          comment.commentType = data[key];
        }
      },
      // Extension comments
      'assessed',
      'extensionResponse',
      'granted',
      'dateAssessed',
      'weeksRequested',
      'taskStatus',
      ['taskDueDate', 'due_date'],
      ['taskExtensions', 'extensions'],

      // Discussion Comments
      'status',
      'numberOfPrompts',
      'timeDiscussionComplete',
      'timeDiscussionStarted',

      // Scorm Comments
      {
        keys: 'testAttempt',
        toEntityFn: (data: object, key: string, comment: ScormComment) => {
          const testAttempt = this.testAttemptService.cache.getOrCreate(
            data[key].id,
            testAttemptService,
            data[key],
            {
              constructorParams: comment.task,
            },
          );
          return testAttempt;
        },
      },

      // Scorm Extension Comments
      ['taskScormExtensions', 'scorm_extensions']
    );

    this.mapping.addJsonKey(
      'granted',

    );
  }

  /**
   * Create a Task Comment - use the type to determine the exact object type to return.
   */
  public createInstanceFrom(json: any, other?: any): TaskComment {
    switch (json.type) {
      case 'discussion':
        return new DiscussionComment(other);
      case 'extension':
        return new ExtensionComment(other);
      case 'scorm':
        return new ScormComment(other);
      case 'scorm_extension':
        return new ScormExtensionComment(other);
      default:
        return new TaskComment(other);
    }
  }

  /**
   * Query for task comments, and update unread message count.
   *
   * @param pathIds The details needed to query the API
   * @param other Contains the related Tasks used to construct the TaskComments
   * @param options
   */
  public query(pathIds?: object, other?: object, options?: RequestOptions<TaskComment>): Observable<TaskComment[]> {
    return super.query(pathIds, options).pipe(
      tap((result) => {
        // Access the task and set the number of new comments to 0 - they are now read on the server
        const task = other as any; //TODO: change to Task object
        task.numNewComments = 0;
      })
    );
  }

  public addComment(
    task: Task,
    data: string | File | Blob,
    commentType: string,
    originalComment?: TaskComment,
    prompts?: Blob[]
  ): Observable<TaskComment> {
    const pathId = {
      projectId: task.project.id,
      taskDefinitionId: task.definition.id,
    };

    const body: FormData = new FormData();
    if (originalComment) {
      body.append('reply_to_id', originalComment?.id.toString());
    }

    const opts: RequestOptions<TaskComment> = { endpointFormat: this.commentEndpointFormat };

    // Based on the comment type - add to the body and configure the end point
    if (commentType === 'text' || commentType === 'scorm') {
      body.append('comment', data);
    } else if (commentType === 'discussion') {
      opts.endpointFormat = this.discussionEndpointFormat;
      for (const prompt of prompts) {
        body.append('attachments[]', prompt);
      }
    } else {
      body.append('attachment', data);
    }

    opts.cache = task.commentCache;
    opts.body = body;
    opts.constructorParams = task;

    return this.create(pathId, opts).pipe(
      tap((tc: TaskComment) => {
        task.refreshCommentData();
        this.commentAdded$.emit(tc);
      })
    );
  }

  public assessExtension(extension: ExtensionComment): Observable<TaskComment> {
    const opts: RequestOptions<TaskComment> = {
      endpointFormat: this.extensionGrantEndpointFormat,
      entity: extension,
    };

    return super.update(
      {
        id: extension.id,
        projectId: extension.project.id,
        taskDefinitionId: extension.task.definition.id,
      },
      opts
    );
  }

  public requestExtension(reason: string, weeksRequested: number, task: any): Observable<TaskComment> {
    const opts: RequestOptions<TaskComment> = {
      endpointFormat: this.requestExtensionEndpointFormat,
      body: {
        comment: reason,
        weeks_requested: weeksRequested,
      },
      cache: task.commentCache
    };
    return super.create(
      {
        projectId: task.project.id,
        taskDefinitionId: task.definition.id,
      },
      opts
    );
  }

  public assessScormExtension(extension: ScormExtensionComment): Observable<TaskComment> {
    const opts: RequestOptions<TaskComment> = {
      endpointFormat: this.scormExtensionGrantEndpointFormat,
      entity: extension,
    };

    return super.update(
      {
        id: extension.id,
        projectId: extension.project.id,
        taskDefinitionId: extension.task.definition.id,
      },
      opts,
    );
  }

  public requestScormExtension(reason: string, task: any): Observable<TaskComment> {
    const opts: RequestOptions<TaskComment> = {
      endpointFormat: this.scormRequestExtensionEndpointFormat,
      body: {
        comment: reason,
      },
      cache: task.commentCache,
    };
    return super.create(
      {
        projectId: task.project.id,
        taskDefinitionId: task.definition.id,
      },
      opts,
    );
  }

  public postDiscussionReply(comment: TaskComment, replyAudio: Blob): Observable<TaskComment>{
    const form = new FormData();
    const pathIds = {
      project_id: comment.project.id,
      task_definition_id: comment.task.id,
      task_comment_id: comment.id
    };

    form.append('attachment', replyAudio);

    return this.create(pathIds, {body: form, cache: comment.task.commentCache});
  }

  // public getDiscussionComment() ->
  // DiscussionComment.getDiscussion.get {project_id: task.project.id, task_definition_id: task.definition.id, task_comment_id: commentID},
  //   (response) -> #success)
  //     onSuccess(response)
  //   (response) -> #failure
  //     onError(response)

  // public getDiscussionPrompt() {
  //   this.downloader.downloadBlob(this.getDiscussionCommentPromptEndpointFormat, )
  // }: resourcePlus , { project_id: "@project_id", task_definition_id: "@task_definition_id", task_comment_id: "@task_comment_id", prompt_number: "@prompt_number" }
  // getDiscussion: resourcePlus "/projects/:project_id/task_def_id/:task_definition_id/comments/:task_comment_id/discussion_comment", { project_id: "@project_id", task_definition_id: "@task_definition_id", task_comment_id: "@task_comment_id" }
}
