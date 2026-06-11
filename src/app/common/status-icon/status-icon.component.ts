import {Component, Input, OnInit} from '@angular/core';
import {TaskStatus, TaskStatusEnum} from 'src/app/api/models/task-status';

@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss'],
  standalone: false,
})
export class StatusIconComponent implements OnInit {
  @Input() status: TaskStatusEnum = 'not_started';
  @Input() showTooltip: boolean;

  statusIcon: (status: TaskStatusEnum) => string;
  statusLabel: (status: TaskStatusEnum) => string;
  statusClass: (status: TaskStatusEnum) => string;

  ngOnInit(): void {
    if (this.showTooltip == null) {
      this.showTooltip = true;
    }
    this.statusIcon = (status: TaskStatusEnum) => TaskStatus.STATUS_MATERIAL_ICONS.get(status);
    this.statusLabel = (status: TaskStatusEnum) => TaskStatus.STATUS_LABELS.get(status);
    this.statusClass = (status: TaskStatusEnum) => TaskStatus.statusClass(status);
  }
}
