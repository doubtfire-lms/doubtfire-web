import { Component, OnInit, EventEmitter, Input, Inject } from '@angular/core';
import { TaskCommentService } from 'src/app/common/services/task-comment.service';
import { taskService, analyticsService, alertService, taskComment } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'app-comment-bubble-action',
  templateUrl: './comment-bubble-action.component.html',
  styleUrls: ['./comment-bubble-action.component.scss']
})
export class CommentBubbleActionComponent implements OnInit {

  @Input() comment: any;
  @Input() task: any;

  constructor(private taskCommentService: TaskCommentService,
  ) { }
  ngOnInit() {
  }

  get canEditComment(): boolean {
    return this.taskCommentService.canUserEdit(this.comment, this.task.project());
  }

  get canReplyToComment(): boolean {
    return true;
  }

  get isBubbleComment(): boolean {
    return this.taskCommentService.isBubbleComment(this.comment);
  }

  react() {
    this.taskCommentService.reactToComment(this.comment.id);
  }

  reply() {
    this.taskCommentService.replyToComment(this.comment.id);
  }

  delete() {
    this.taskCommentService.deleteComment(this.task, this.comment);
  }
}
