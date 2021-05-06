import { Component, OnInit, Input } from '@angular/core';
import { TaskComment } from 'src/app/api/models/doubtfire-model';
import { TaskCommentComposerData } from '../../task-comment-composer/task-comment-composer.component';

@Component({
  selector: 'comment-bubble-action',
  templateUrl: './comment-bubble-action.component.html',
  styleUrls: ['./comment-bubble-action.component.scss'],
})
export class CommentBubbleActionComponent implements OnInit {
  @Input() comment: TaskComment;
  @Input() sharedData: TaskCommentComposerData;

  constructor() {}
  ngOnInit() {}

  reply() {
    this.sharedData.originalComment = this.comment;
  }

  delete() {
    this.comment.delete();
  }
}
