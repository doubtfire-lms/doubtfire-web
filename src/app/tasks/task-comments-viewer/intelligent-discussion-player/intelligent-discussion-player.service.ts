import { Injectable, Inject } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { DiscussionComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(
    @Inject(alertService) private alerts: any,
    private taskService: TaskCommentService
  ) { }

  handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
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
