import {Task} from 'src/app/api/models/task';
import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'f-task-due-card',
  templateUrl: './task-due-card.component.html',
  styleUrls: ['./task-due-card.component.scss'],
  standalone: false,
})
export class TaskDueCardComponent implements OnInit {
  @Input() task: Task;
  constructor() {}

  ngOnInit(): void {}

  public get flexibleDatesEnabled(): boolean {
    return this.task?.unit?.allowFlexibleDates;
  }
}
