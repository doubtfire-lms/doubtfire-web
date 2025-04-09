import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AppInjector} from 'src/app/app-injector';
import {TaskCommentService} from '../../services/task-comment.service';
import {TaskComment, Task} from '../doubtfire-model';

export class ScormExtensionComment extends TaskComment {
  assessed: boolean;
  granted: boolean;
  dateAssessed: Date;
  taskScormExtensions: number;

  constructor(task: Task) {
    super(task);
  }

  private assessScormExtension(): Observable<TaskComment> {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    return tcs.assessScormExtension(this).pipe(
      tap((tc: TaskComment) => {
        const scormExtension: ScormExtensionComment = tc as ScormExtensionComment;

        const task = tc.task;
        task.scormExtensions = scormExtension.taskScormExtensions;
      }),
    );
  }

  public grant(): Observable<TaskComment> {
    this.granted = true;
    return this.assessScormExtension();
  }
}
