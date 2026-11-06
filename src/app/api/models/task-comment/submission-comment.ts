import {Observable} from 'rxjs';
import {AppInjector} from 'src/app/app-injector';
import {TaskCommentService} from '../../services/task-comment.service';
import {Task, TaskComment} from '../doubtfire-model';

/** A student's request for early submission access and the staff assessment. */
export class SubmissionComment extends TaskComment {
  submissionAssessedAt: Date | null;
  submissionGranted: boolean | null;

  constructor(task: Task) {
    super(task);
  }

  private assessSubmissionAccess(granted: boolean): Observable<TaskComment> {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    return tcs.assessSubmissionAccess(this, granted);
  }

  public grant(): Observable<TaskComment> {
    return this.assessSubmissionAccess(true);
  }

  public deny(): Observable<TaskComment> {
    return this.assessSubmissionAccess(false);
  }

  get assessed(): boolean {
    return !!this.submissionAssessedAt;
  }
}
