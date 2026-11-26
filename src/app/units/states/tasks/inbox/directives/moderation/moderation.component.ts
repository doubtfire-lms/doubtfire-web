import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {FeedbackModerationActionType, Task} from 'src/app/api/models/task';
import {AlertService} from 'src/app/common/services/alert.service';
import {ConfirmModerationModalService} from './confirm-moderation-modal/confirm-moderation-modal.service';

@Component({
  selector: 'f-moderation',
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ModerationComponent {
  @Input() task: Task;

  public moderated: Map<Task, boolean> = new Map<Task, boolean>();

  constructor(
    private alertService: AlertService,
    private confirmModerationModal: ConfirmModerationModalService,
    private router: Router,
  ) {}

  overturn() {
    this.confirmModerationModal.show(
      this.task,
      'Overturn',
      `The original feedback will be revised and the task outcome updated.
      Provide clear, constructive feedback explaining the changes made, and record any guidance for the tutor in the moderation notes section.`,
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
      `After reviewing the task and feedback, you are satisfied that the original marking and comments are appropriate and align with the assessment criteria.
      No changes will be made.
      Ensure any concerns raised by the student have been considered and addressed where necessary.`,
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

  snooze() {
    this.confirmModerationModal.show(
      this.task,
      'Snooze task',
      'This task will be hidden from moderation until the tutor leaves new feedback. This will not affect how many tasks from this tutor are selected for moderation.',
      'snooze',
      false,
      (applyToAll) => {
        this.moderateTask('snooze', applyToAll);
      },
    );
  }

  private moderateTask(action: FeedbackModerationActionType, applyToAll: boolean = false) {
    this.task.moderateFeedback(action, applyToAll).subscribe({
      next: (_response) => {
        if (applyToAll) {
          this.alertService.success(
            `Tasks moderated successfully. Refresh the list to view the updated queue.`,
            6000,
          );
        } else {
          this.alertService.success(`Task moderated successfully`, 2000);
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
