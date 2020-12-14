import { Component, OnInit, Input } from '@angular/core';
import { TaskCommentViewService } from 'src/app/common/services/task-comment.service';

@Component({
  selector: 'comment-bubble-action',
  templateUrl: './comment-bubble-action.component.html',
  styleUrls: ['./comment-bubble-action.component.scss'],
})
export class CommentBubbleActionComponent implements OnInit {
  @Input() comment: any;
  @Input() task: any;

  constructor(private taskCommentViewService: TaskCommentViewService) {}
  ngOnInit() {}

  get canEditComment(): boolean {
    return this.taskCommentViewService.canUserEdit(this.comment, this.task.project());
  }

  get canReplyToComment(): boolean {
    return true;
  }

  react() {
    // this.taskCommentViewService.reactToComment(this.comment.id);
  }

  reply() {
    this.taskCommentViewService.replyToComment(this.comment.id);
  }

  delete() {
    this.taskCommentViewService.deleteComment(this.task, this.comment);
  }
}
