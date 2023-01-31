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

  get unselected(): boolean {
    return this.selectedTask == null;
  }

  get noUser(): boolean {
    return this.selectedTask == null;
  }

  goToStudent(): void {
    this.router.stateService.go('projects/dashboard', {
      projectId: this.selectedTask.project.id,
      tutor: true,
      taskAbbr: '',
    });
  }

  goToStudentTask(): void {
    this.router.stateService.go('projects/dashboard', {
      projectId: this.selectedTask.project.id,
      taskAbbr: this.selectedTask.definition.abbreviation,
      tutor: true,
    });
  }
}
