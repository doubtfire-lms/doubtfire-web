import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { taskService, Task } from 'src/app/ajs-upgraded-providers';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(@Inject(taskService) private ts: any,
    @Inject(Task) private Task: any,
    private http: HttpClient,
  ) { }

  getDiscussionPromptUrl(task: any, taskCommentID: number, promptNumber: number): string {
    console.log(this.Task);
    return this.Task.generateDiscussionPromptUrl(task, taskCommentID, promptNumber);
    // return new Promise((resolve, reject) => {
    //   this.ts.getDiscussionPrompt(task, taskCommentID, promptNumber, ((result: Blob) => resolve(result)), ((error: any) => reject(error)));
    // });

  }

  getDiscussionFiles() {
    return this.http.get(`https://api.github.com/users/${1}`);
  }

  postReply() {
    // /projects/:project_id/task_def_id/:task_definition_id/comments/:task_comment_id/discussion_comment/reply
  }
}
