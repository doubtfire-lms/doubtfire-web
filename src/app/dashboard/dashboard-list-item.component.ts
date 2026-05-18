import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'f-dashboard-list-item',
  templateUrl: './dashboard-list-item.component.html',
  styleUrl: './dashboard-list-item.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class DashboardListItemComponent {
  @Input() taskName: string = 'Task Name';
  @Input() taskLabel: string = '1.1P - Pass Task';
  @Input() color: string = 'gray';
  @Input() alertType: string = '';
  @Input() alertCount: number = 0;
  @Input() badge: string = '';
  @Input() badgeColor: string = 'gray';
  @Input() time: string = '';
  @Input() description: string = '';
  @Input() dueDate: string = '';

  expanded: boolean = false;
}