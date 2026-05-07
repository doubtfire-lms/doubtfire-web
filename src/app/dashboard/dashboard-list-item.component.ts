import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'dashboard-list-item',
  templateUrl: './dashboard-list-item.component.html',
  styleUrls: ['./dashboard-list-item.component.scss']
})
export class DashboardListItemComponent {
  @Input() task: any;

  constructor(private router: Router) {}

  goToTask() {
    if (!this.task) return;

    this.router.navigate([
      '/units',
      this.task.unitId,
      'tasks',
      this.task.id
    ]);
  }
}