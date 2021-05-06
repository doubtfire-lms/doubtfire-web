import { Injectable, Inject } from '@angular/core';
import { alertService, taskService, Task } from 'src/app/ajs-upgraded-providers';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(
    @Inject(taskService) private ts: any,
    @Inject(Task) private TaskModel: any,
    @Inject(alertService) private alerts: any
  ) {}

  handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  getDiscussionPromptUrl(task: any, taskCommentID: number, promptNumber: number): string {
    return this.TaskModel.generateDiscussionPromptUrl(task, taskCommentID, promptNumber);
  }

  getDiscussionResponseUrl(task: any, taskCommentID: number): string {
    return this.TaskModel.generateDiscussionResponseUrl(task, taskCommentID);
  }

  addDiscussionReply(task: any, taskCommentID: number, audio): void {
    this.ts.postDiscussionReply(
      task,
      taskCommentID,
      audio,
      () => {},
      (error: any) => this.handleError(error)
    );
  }
}
