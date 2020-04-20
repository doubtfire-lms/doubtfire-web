import { Component, Input, Inject } from '@angular/core';
import { taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss']
})
export class StatusIconComponent implements OnInit {

  @Input() status;
  @Input() showTooltip: boolean;

  statusIcon;
  statusLabel;
  statusClass;

  constructor(@Inject(taskService) private taskService) { }

  ngOnInit(): void {
    if (this.showTooltip == null) { this.showTooltip = true; }
    this.statusIcon = status => this.taskService.statusIcons[status];
    this.statusLabel = status => this.taskService.statusLabels[status];
    this.statusClass = status => this.taskService.statusClass(status);
  }
}
