import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Task} from 'src/app/api/models/task';

@Component({
  selector: 'f-task-due-card',
  templateUrl: './task-due-card.component.html',
  styleUrls: ['./task-due-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDueCardComponent {
  @Input() task: Task;

  public get flexibleDatesEnabled(): boolean {
    return this.task?.unit?.allowFlexibleDates;
  }
}
