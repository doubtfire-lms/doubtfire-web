import { Component, Input, Inject } from '@angular/core';
import { taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['status-icon.component.scss']
})
export class StatusIconComponent {
  @Input() status: string;
  @Input() showTooltip: boolean = true;

  constructor (
    @Inject(taskService) private ts: any
  ) {
  }

  public statusIcon (status: string) : string {
    return this.ts.statusIcons[status];
  }

  public statusLabel (status: string) : string {
    return this.ts.statusLabels[status];
  }

  public statusClass (status: string) : string {
    return this.ts.statusClass(status);
  }

}
