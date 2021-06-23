import { Component, OnInit, Input, Inject } from '@angular/core';
import { taskService, alertService } from 'src/app/ajs-upgraded-providers';

export interface TaskStatus {
  icon: string;
  label: string;
  class: string;
  showtooltip?: boolean;
}

@Component({
  selector: 'task-status-icon',
  templateUrl: './task-status-icon.component.html',
  styleUrls: ['./task-status-icon.component.scss']
})
export class TaskStatusIconComponent implements OnInit {
  @Input() taskStatus: string;
  status: TaskStatus;
  constructor(
    @Inject(taskService) private taskServiceLegacy: any
  ) { }

  ngOnInit() {
    this.status = {
      icon: this.taskServiceLegacy.statusIcons[this.taskStatus],
      label: this.taskServiceLegacy.statusLabels[this.taskStatus],
      class: this.taskServiceLegacy.statusClass(this.taskStatus),
    };
  }

}
