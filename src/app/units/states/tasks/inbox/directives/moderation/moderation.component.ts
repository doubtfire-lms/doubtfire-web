import {Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

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
  ) {}

  showMore() {
    console.log('bad!');
    this.confirmationModal.show(
      'Show more from this tutor',
      `There were concerns with feedback and you would like to see more tasks from this tutor. You will review this task again if further feedback is provided.`,
      () => {
        this.moderateTask(-1);
      },
    );
  }

  showLess() {
    this.confirmationModal.show(
      'Show less from this tutor',
      `The feedback provided by the tutor is satisfactory and you would like to see less of their feedback for moderation. You won't see this task again.`,
      () => {
        this.moderateTask(1);
      },
    );
  }

  dismiss() {
    this.confirmationModal.show(
      'Dismiss from moderation',
      'This task will be removed from moderation and will not get a follow up. This will not affect how many tasks from this tutor are selected for moderation.',
      () => {
        this.moderateTask(0);
      },
    );
  }

  private moderateTask(score: -1 | 0 | 1) {
    this.task.moderateFeedback(score).subscribe({
      next: (response) => {
        console.log(response);
        this.alertService.success(`Task moderated`, 2000);
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
