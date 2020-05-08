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
    if (this.hasPortfolio()) {
      return 'complete';
    }
    return 'not_started';
  }

  public statusClass(): string {
    return this.ts.statusClass(this.status());
  }

  public hasPortfolio(): boolean {
    return this.project.portfolio_status > 0;
  }

  public switchToPortfolioCreation() {
    this.router.stateService.go('projects/portfolio')
  }
}
