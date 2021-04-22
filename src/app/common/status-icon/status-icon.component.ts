import { Component, Input, Inject, OnInit } from '@angular/core';
import { taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss'],
})
export class StatusIconComponent implements OnInit {
  @Input() status;
  @Input() showTooltip: boolean;

  statusIcon;
  statusLabel;
  statusClass;

  constructor(@Inject(taskService) private TaskService) {}

  ngOnInit(): void {
    if (this.showTooltip == null) {
      this.showTooltip = true;
    }
    this.statusIcon = (status) => this.TaskService.statusIcons[status];
    this.statusLabel = (status) => this.TaskService.statusLabels[status];
    this.statusClass = (status) => this.TaskService.statusClass(status);
  }
}
