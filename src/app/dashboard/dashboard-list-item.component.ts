import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DashboardTask {
  title: string;
  subtitle: string;
  abbreviation: string;
  color: string;
  comments: number;
}

@Component({
  selector: 'f-dashboard-list-item',
  templateUrl: './dashboard-list-item.component.html',
  styleUrl: './dashboard-list-item.component.scss',
})
export class DashboardListItemComponent {
  @Input() title: string = 'Task Name';
  @Input() subtitle: string = '1.1P - Pass Task';
  @Input() abbreviation: string = '';
  @Input() color: string = 'gray';
  @Input() comments: number = 0;

  expanded: boolean = false;
}
