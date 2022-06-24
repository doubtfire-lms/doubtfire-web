import { Injectable, Inject } from '@angular/core';
import { alertService, Task } from 'src/app/ajs-upgraded-providers';
import { DiscussionComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(
    @Inject(Task) private TaskModel: any,
    @Inject(alertService) private alerts: any,
    private taskService: TaskCommentService
  ) { }

  handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  getDiscussionPromptUrl(task: any, taskCommentID: number, promptNumber: number): string {
    return this.TaskModel.generateDiscussionPromptUrl(task, taskCommentID, promptNumber);
  }

  getDiscussionResponseUrl(task: any, taskCommentID: number): string {
    return this.TaskModel.generateDiscussionResponseUrl(task, taskCommentID);
  }

  addDiscussionReply(comment: DiscussionComment, audio: Blob): void {
    this.taskService.postDiscussionReply(
      comment,
      audio).subscribe({
        next: () => { },
        error: (message) => { this.handleError(message); }
      });
  }
}
