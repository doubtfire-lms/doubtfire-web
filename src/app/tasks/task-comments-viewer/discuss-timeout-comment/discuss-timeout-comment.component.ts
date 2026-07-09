import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TaskComment} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-discuss-timeout-comment',
  templateUrl: './discuss-timeout-comment.component.html',
  styleUrls: ['./discuss-timeout-comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DiscussTimeoutCommentComponent {
  @Input() comment: TaskComment;

  get expired(): boolean {
    return this.comment?.commentType === 'discuss_timeout_expired';
  }

  get icon(): string {
    return this.expired ? 'assignment_return' : 'schedule';
  }

  get title(): string {
    return this.expired ? 'Discuss timeout expired' : 'Discuss timeout warning';
  }
}
