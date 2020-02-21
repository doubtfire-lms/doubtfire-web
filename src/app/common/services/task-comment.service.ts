import { Injectable, Inject } from '@angular/core';
import { taskComment, taskService, analyticsService, alertService } from 'src/app/ajs-upgraded-providers';

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {

  commentResourceUrl: string = '';
  commentType: string = '';
  task: string = '';
  audioContext: string = '';

  constructor(
    @Inject(taskComment) private tc: any,
    @Inject(taskService) private ts: any,
    @Inject(analyticsService) private analytics: any,
    @Inject(alertService) private alerts: any,
  ) { }

  setResourceUrl(resourceURL) {
    if (resourceURL) {
      this.commentResourceUrl = resourceURL;
    }
  }

  setCommentType(commentType) {
    if (commentType) {
      this.commentType = commentType;
    }
  }

  setTask(task) {
    if (task) {
      this.task = task;
    }
  }

  replyToComment(originalCommentID) {
    this.ts.currentReplyID.id =  originalCommentID;
  }

  // reactToComment(originalComment) {
  // }

  isStaff(project: any) {
    return project.unit().my_role !== 'Student';
  }

  canUserEdit(comment, project) {
    return comment.author_is_me || this.isStaff(project);
  }

  isBubbleComment(comment) {
    return this.ts.isBubbleComment(comment.type);
  }

  deleteComment(task, comment) {
    this.tc.delete(
      { project_id: task.project().project_id, task_definition_id: task.task_definition_id, id: comment.id },
      (success) => {
        let comments = task.comments.filter(e => e.id !== comment.id);
        comments = this.ts.mapComments(comments);
        task.comments = comments;
        this.analytics.event('View Task Comments', 'Deleted existing comment');
      },
      (error) => {
        this.alerts.add('danger', error.data.error, 2000);
      });
  }
}
