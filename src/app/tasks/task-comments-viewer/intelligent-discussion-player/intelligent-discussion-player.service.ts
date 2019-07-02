import { Injectable, Inject } from '@angular/core';
import { taskService, Task } from 'src/app/ajs-upgraded-providers';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(@Inject(taskService) private ts: any,
    @Inject(Task) private Task: any
  ) { }

  getDiscussionPromptUrl(task: any, taskCommentID: number, promptNumber: number): string {
    return this.Task.generateDiscussionPromptUrl(task, taskCommentID, promptNumber);
  }
}
