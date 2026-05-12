import {Component, Input} from '@angular/core';

export type DashboardTask = {
  title: string;
  subtitle: string;
  abbreviation: string;
  color: string;
  comments: number;
};

@Component({
  selector: 'f-dashboard-list-item',
  templateUrl: './dashboard-list-item.component.html',
})
export class DashboardListItemComponent {
  @Input() task: DashboardTask;
}
