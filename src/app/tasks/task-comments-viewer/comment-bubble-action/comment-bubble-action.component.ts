import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TaskComment} from 'src/app/api/models/doubtfire-model';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {TaskCommentComposerData} from '../../task-comment-composer/task-comment-composer.component';

@Component({
  selector: 'comment-bubble-action',
  templateUrl: './comment-bubble-action.component.html',
  styleUrls: ['./comment-bubble-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CommentBubbleActionComponent {
  @Input() comment: TaskComment;
  @Input() sharedData: TaskCommentComposerData;

  constructor(private confirmationModalService: ConfirmationModalService) {}

  reply() {
    this.sharedData.editingComment = null;
    this.sharedData.originalComment = this.comment;
  }

  edit() {
    this.sharedData.originalComment = null;
    this.sharedData.editingComment = this.comment;
  }

  delete() {
    this.confirmationModalService.show(
      `Delete comment`,
      `Are you sure you want to delete this comment?`,
      () => {
        this.comment.delete();
      },
    );
  }
}
