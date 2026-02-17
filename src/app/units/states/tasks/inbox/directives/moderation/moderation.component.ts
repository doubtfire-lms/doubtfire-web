import {Component, Input} from '@angular/core';
import {FeedbackModerationActionType, Task} from 'src/app/api/models/task';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {ConfirmModerationModalService} from './confirm-moderation-modal/confirm-moderation-modal.service';

@Component({
  selector: 'f-moderation',
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
})
export class ModerationComponent {
  @Input() task: Task;

  public moderated: Map<Task, boolean> = new Map<Task, boolean>();

  constructor(
    private alertService: AlertService,
    private confirmationModal: ConfirmationModalService,
    private confirmModerationModal: ConfirmModerationModalService,
  ) {}

  overturn() {
    this.confirmModerationModal.show(
      this.task,
      'Overturn',
      `There were concerns with feedback given to the student and you have changed the status of the task.`,
      'overturn',
      false,
      () => {
        this.moderateTask('overturn');
      },
    );
  }

  upheld() {
    this.confirmModerationModal.show(
      this.task,
      'Upheld',
      `The feedback given to the student was justified, and no changes are required.`,
      'upheld',
      false,
      () => {
        this.moderateTask('upheld');
      },
    );
  }

  showMore() {
    this.confirmModerationModal.show(
      this.task,
      'Show more from this tutor',
      `There were concerns with feedback and you would like to see more tasks from this tutor. You will review this task again if further feedback is provided.`,
      'show_more',
      false,
      () => {
        this.moderateTask('show_more');
      },
    );
  }

  showLess() {
    this.confirmModerationModal.show(
      this.task,
      'Show less from this tutor',
      `The feedback provided by the tutor is satisfactory and you would like to see less of their feedback for moderation. You won't see this task again.`,
      'show_less',
      true,
      (applyToAll) => {
        this.moderateTask('show_less', applyToAll);
      },
    );
  }

  dismiss() {
    this.confirmModerationModal.show(
      this.task,
      'Dismiss from moderation',
      'This task will be removed from moderation and will not get a follow up. This will not affect how many tasks from this tutor are selected for moderation.',
      'dismiss_ok',
      true,
      (applyToAll) => {
        this.moderateTask('dismiss_ok', applyToAll);
      },
    );
  }

  private moderateTask(action: FeedbackModerationActionType, applyToAll: boolean = false) {
    this.task.moderateFeedback(action, applyToAll).subscribe({
      next: (response) => {
        console.log(response);
        this.alertService.success(`Task moderated`, 2000);
        if (applyToAll) {
          // TODO: we should this.setModerated for all tasks in our queue
          // TODO: should it just refresh the queue?
        }
        this.setModerated(this.task);
      },
      error: (error) => {
        this.alertService.error(`Failed to moderate task: ${error}`, 6000);
      },
    });
  }

  private setModerated(task: Task) {
    this.moderated.set(task, true);
  }

  public isModerated(task: Task): boolean {
    return this.moderated.get(task);
  }
}
