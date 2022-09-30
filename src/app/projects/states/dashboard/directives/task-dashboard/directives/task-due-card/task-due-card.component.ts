import { Component, Input, OnInit } from '@angular/core';
import { Task } from 'src/app/api/models/task';

@Component({
  selector: 'f-task-due-card',
  templateUrl: './task-due-card.component.html',
  styleUrls: ['./task-due-card.component.scss'],
})
export class TaskDueCardComponent implements OnInit {
  @Input() task: Task;
  constructor() {}

  ngOnInit(): void {}
}
