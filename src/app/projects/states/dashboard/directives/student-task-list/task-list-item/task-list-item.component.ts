import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/doubtfire-model';

const START_APPROACHING_DAYS = 7;
const DUE_APPROACHING_DAYS = 5;

@Component({
  selector: 'task-list-item',
  templateUrl: 'task-list-item.component.html',
  styleUrls: ['task-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskListItemComponent {
  @Input({required: true}) task: Task;

  public get gradeName(): string {
    return this.task?.unit?.gradeLabel(this.task.definition.targetGrade) ?? '';
  }

  public taskStartApproaching(): boolean {
    return (
      !!this.task &&
      !this.task.inFinalState() &&
      this.task.isBeforeStartDate() &&
      this.task.daysUntilStartDate() <= START_APPROACHING_DAYS
    );
  }

  public taskStartLabel(): string {
    const days = this.task.daysUntilStartDate();

    if (days <= 0) {
      return 'Start today';
    }

    return `Start in ${days} ${days === 1 ? 'day' : 'days'}`;
  }

  public taskOngoing(): boolean {
    if (!this.task || this.task.inFinalState()) {
      return false;
    }

    const now = Date.now();
    const startTime = this.dateTime(this.task.startDate);
    const dueTime = this.dateTime(this.task.localDueDate());

    return now >= startTime && now < dueTime;
  }

  public taskDueApproaching(): boolean {
    return (
      !!this.task &&
      !this.task.isBeforeStartDate() &&
      !this.task.inSubmittedState() &&
      this.task.daysUntilDueDate() <= DUE_APPROACHING_DAYS
    );
  }

  private dateTime(date: Date): number {
    const time = date ? new Date(date).getTime() : NaN;
    return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
  }
}
