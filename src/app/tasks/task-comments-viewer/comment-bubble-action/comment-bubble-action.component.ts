import { Component, OnInit, Input } from '@angular/core';
import { TaskCommentService } from 'src/app/common/services/task-comment.service';

@Component({
  selector: 'comment-bubble-action',
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

  react() {
    // this.taskCommentService.reactToComment(this.comment.id);
  }

  reply() {
    this.taskCommentService.replyToComment(this.comment.id);
  }

  delete() {
    this.taskCommentService.deleteComment(this.task, this.comment);
  }
}
