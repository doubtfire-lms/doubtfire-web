import { TaskComment } from 'src/app/api/models/doubtfire-model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CachedEntityService } from '../cached-entity.service';

@Injectable()
export class TaskCommentService extends CachedEntityService<TaskComment> {
  protected readonly endpointFormat = 'projects/:projectId:/task_def_id/:taskDefinitionId:/comments/:id:';
  entityName = 'TaskComment';

  protected createInstanceFrom(json: any, other?: any): TaskComment {
    return new TaskComment(json, other);
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  public addComment(
    task: any,
    data: string | File | Blob,
    commentType: string,
    originalComment?: TaskComment
  ): Observable<TaskComment> {
    const pathId: {} = {
      projectId: task.project().project_id,
      taskDefinitionId: task.task_definition_id,
    };

    const body: FormData = new FormData();
    if (originalComment) {
      body.append('reply_to_id', originalComment?.id.toString());
    }

    if (commentType === 'text') {
      body.append('comment', data);
    } else {
      body.append('attachment', data);
    }

    this.cacheSource = task.commentCache;
    return this.create(pathId, body, task).pipe(
      tap((tc: TaskComment) => {
        task.comments.push(tc);
        task.refreshCommentData();
      })
    );
  }
}
