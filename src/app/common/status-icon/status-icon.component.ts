import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {TaskStatus, TaskStatusEnum} from 'src/app/api/models/task-status';

@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StatusIconComponent implements OnInit {
  @Input() status?: TaskStatusEnum = 'not_started';
  @Input() showTooltip: boolean;
  @Input() compact = false;

  ngOnInit(): void {
    if (this.showTooltip == null) {
      this.showTooltip = true;
    }
  }

  get statusIcon(): string {
    return TaskStatus.STATUS_MATERIAL_ICONS.get(this.resolvedStatus) ?? 'pause';
  }

  get statusLabel(): string {
    return TaskStatus.STATUS_LABELS.get(this.resolvedStatus) ?? 'Not Started';
  }

  get statusClass(): string {
    return TaskStatus.statusClass(this.resolvedStatus);
  }

  get resolvedStatus(): TaskStatusEnum {
    return this.status && TaskStatus.STATUS_KEYS.includes(this.status)
      ? this.status
      : 'not_started';
  }
}
