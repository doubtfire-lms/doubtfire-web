import {Component, Input, Inject} from '@angular/core';
import {confirmationModal} from 'src/app/ajs-upgraded-providers';
import {
  Task,
  ScormComment,
  User,
  UserService,
  TestAttemptService,
} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-scorm-comment',
  templateUrl: './scorm-comment.component.html',
  styleUrls: ['./scorm-comment.component.scss'],
})
export class ScormCommentComponent {
  @Input() task: Task;
  @Input() comment: ScormComment;

  user: User;

  constructor(
    private userService: UserService,
    private testAttemptService: TestAttemptService,
    @Inject(confirmationModal) private confirmationModal: any,
  ) {
    this.user = this.userService.currentUser;
  }

  reviewScormTest() {
    this.comment.testAttempt.review();
  }

  passScormAttempt() {
    this.confirmationModal.show(
      'Pass Test Attempt',
      'Are you sure you want to pass this test attempt? This action will override the success status of this test attempt to a pass.',
      () => {
        this.testAttemptService.overrideSuccessStatus(this.comment.testAttempt.id, true);
      },
    );
  }

  deleteScormAttempt() {
    this.confirmationModal.show(
      'Delete Test Attempt',
      'Are you sure you want to delete this test attempt? This action is final and will delete information associated with this test attempt.',
      () => {
        this.testAttemptService.deleteAttempt(this.comment.testAttempt.id);
        this.comment.delete();
      },
    );
  }
}
