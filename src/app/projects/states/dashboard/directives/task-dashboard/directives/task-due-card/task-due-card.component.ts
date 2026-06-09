import {Task} from 'src/app/api/models/task';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-task-due-card',
  templateUrl: './task-due-card.component.html',
  styleUrls: ['./task-due-card.component.scss'],
  standalone: false,
})
export class TaskDueCardComponent {
  @Input() task: Task;

  public get flexibleDatesEnabled(): boolean {
    return this.task?.unit?.allowFlexibleDates;
  }
}
