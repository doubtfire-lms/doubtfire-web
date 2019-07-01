import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class IntelligentDiscussionPlayerService {
  constructor(private http: HttpClient) { }

  getDiscussionFiles() {
    return this.http.get(`https://api.github.com/users/${1}`);
  }

  postReply() {
    // /projects/:project_id/task_def_id/:task_definition_id/comments/:task_comment_id/discussion_comment/reply
  }
}
