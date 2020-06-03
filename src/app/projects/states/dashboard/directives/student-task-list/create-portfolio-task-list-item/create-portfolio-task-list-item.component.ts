import { Component, Input, Inject } from '@angular/core';
import { taskService } from 'src/app/ajs-upgraded-providers';
import { UIRouter } from '@uirouter/angular';

@Component({
  selector: 'create-portfolio-task-list-item',
  templateUrl: 'create-portfolio-task-list-item.component.html',
  styleUrls: ['create-portfolio-task-list-item.component.scss']
})
export class CreatePortfolioTaskListItemComponent {
  @Input() setSelectedTask: any;
  @Input() project: any;

  constructor(
    @Inject(taskService) private ts: any,
    @Inject(UIRouter) private router: UIRouter
  ) {
  }

  public status(): string {
    return this.project.portfolioTaskStatus()
  }

  public statusClass(): string {
    return this.project.portfolioTaskStatusClass()
  }

  public switchToPortfolioCreation() {
    this.router.stateService.go('projects/portfolio')
  }
}
