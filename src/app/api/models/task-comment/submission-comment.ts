import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
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
    return tcs.assessSubmissionAccess(this, granted).pipe(
      tap((tc: TaskComment) => {
        const submission = tc as SubmissionComment;
        const task = tc.task;

        // A denial does not revoke access granted by an earlier request.
        task.submissionAccessGranted =
          task.submissionAccessGranted || (submission.assessed && submission.submissionGranted === true);
        task.submissionAccessRequestError = task.submissionsNotOpen
          ? null
          : 'Submissions are already open for this task.';
      }),
    );
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
