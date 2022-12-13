import { Component, Input } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { Project, ProjectService } from 'src/app/api/models/doubtfire-model';
import { UserService } from 'src/app/api/services/user.service';

@Component({
  selector: 'f-user-badge',
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.scss'],
})
export class UserBadgeComponent {
  constructor(private userService: UserService, private router: UIRouter, private projectService: ProjectService) {}
  @Input() project: Project;

  goToStudent(): void {
    this.router.stateService.go('projects/dashboard', {
      projectId: this.project.id,
      tutor: true,
      taskAbbr: '',
    });
  }
}
