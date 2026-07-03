import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {Project, Task, TaskStatusEnum} from 'src/app/api/models/doubtfire-model';
import {StatusIconComponent} from '../../../../../../common/status-icon/status-icon.component';

@Component({
  selector: 'create-portfolio-task-list-item',
  templateUrl: 'create-portfolio-task-list-item.component.html',
  styleUrls: ['create-portfolio-task-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, MatIcon, StatusIconComponent],
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
