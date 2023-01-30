import { Component, Input } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { Task } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-user-badge',
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.scss'],
})
export class UserBadgeComponent {
  constructor(private router: UIRouter) {}
  @Input() selectedTask: Task;

  goToStudent(): void {
    this.router.stateService.go('projects/dashboard', {
      projectId: this.selectedTask.project.id,
      tutor: true,
      taskAbbr: '',
    });
  }
}
