import { Component, Input, Inject } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { Project, Task } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'create-portfolio-task-list-item',
  templateUrl: 'create-portfolio-task-list-item.component.html',
  styleUrls: ['create-portfolio-task-list-item.component.scss'],
})
export class CreatePortfolioTaskListItemComponent {
  @Input() setSelectedTask: Task;
  @Input() project: Project;

  constructor(@Inject(UIRouter) private router: UIRouter) {}

  public status(): string {
    return this.project.portfolioTaskStatus();
  }

  public statusClass(): string {
    return this.project.portfolioTaskStatusClass();
  }

  public switchToPortfolioCreation() {
    this.router.stateService.go('projects/portfolio');
  }
}
