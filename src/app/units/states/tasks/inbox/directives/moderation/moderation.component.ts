import {Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/task';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-moderation',
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
})
export class ModerationComponent {
  @Input() task: Task;

  public moderated: Map<Task, boolean> = new Map<Task, boolean>();

  constructor(private alertService: AlertService) {}

  showMore() {
    console.log('bad!');

    this.task.moderateFeedback(-1).subscribe({
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

  showLess() {
    console.log('good!');

    this.task.moderateFeedback(1).subscribe({
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

  dismiss() {
    this.task.moderateFeedback(0).subscribe({
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
