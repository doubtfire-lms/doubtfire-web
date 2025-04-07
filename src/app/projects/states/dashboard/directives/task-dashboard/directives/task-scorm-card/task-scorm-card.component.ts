import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Task, User, UserService} from 'src/app/api/models/doubtfire-model';
import {ScormExtensionModalService} from 'src/app/common/modals/scorm-extension-modal/scorm-extension-modal.service';

@Component({
  selector: 'f-task-scorm-card',
  templateUrl: './task-scorm-card.component.html',
  styleUrls: ['./task-scorm-card.component.scss'],
})
export class TaskScormCardComponent implements OnChanges {
  @Input() task: Task;
  attemptsLeft: number;
  isPassed: boolean;
  user: User;

  constructor(
    private extensions: ScormExtensionModalService,
    private userService: UserService,
  ) {
    this.user = this.userService.currentUser;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.task && changes.task.currentValue && changes.task.currentValue.scormEnabled) {
      this.attemptsLeft = undefined;
      this.isPassed = undefined;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.task?.fetchTestAttempts().subscribe((_) => {
        this.getAttemptsLeft();
        if (this.task.latestCompletedTestAttempt) this.isPassed = this.task.scormPassed;
      });
    }
  }

  getAttemptsLeft(): void {
    if (this.task.definition.scormAttemptLimit != 0) {
      const attempts = this.task.testAttemptCache.currentValues;
      let count = attempts.length;
      if (count > 0 && attempts[0].terminated === false) count--;
      this.attemptsLeft =
        this.task.definition.scormAttemptLimit + this.task.scormExtensions - count;
    }
  }

  launchScormPlayer(): void {
    this.task.launchScormPlayer();
  }

  reviewLatestCompletedAttempt(): void {
    this.task.latestCompletedTestAttempt.review();
  }

  requestExtraAttempt(): void {
    this.extensions.show(this.task, () => {
      this.task.refresh();
    });
  }
}
