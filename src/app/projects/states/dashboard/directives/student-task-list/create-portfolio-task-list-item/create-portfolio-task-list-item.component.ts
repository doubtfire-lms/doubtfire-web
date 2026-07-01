import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project, Task, TaskStatusEnum} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'create-portfolio-task-list-item',
  templateUrl: 'create-portfolio-task-list-item.component.html',
  styleUrls: ['create-portfolio-task-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CreatePortfolioTaskListItemComponent {
  @Input() setSelectedTask: Task;
  @Input() project: Project;

  public status(): TaskStatusEnum {
    return this.project.portfolioTaskStatus();
  }

  public statusClass(): string {
    return this.project.portfolioTaskStatusClass();
  }
}
