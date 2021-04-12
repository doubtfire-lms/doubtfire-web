import { Component, Input} from '@angular/core';

@Component({
  selector: 'task-due-card',
  templateUrl: 'task-due-card.component.html',
  styleUrls: ['task-due-card.component.scss']
})
export class TaskDueCardComponent {
  @Input() task: any;
  constructor(
  ) {
    };
}

