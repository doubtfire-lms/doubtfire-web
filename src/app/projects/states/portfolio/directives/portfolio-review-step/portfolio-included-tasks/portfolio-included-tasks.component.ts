import {Component, Input, OnInit} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {Task} from 'src/app/api/models/task';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-portfolio-included-tasks',
  templateUrl: 'portfolio-included-tasks.component.html',
  styleUrls: ['portfolio-included-tasks.component.scss'],
})
export class PortfolioIncludedTasksComponent implements OnInit {
  @Input() project: Project;

  constructor(private alertService: AlertService) {}

  loading: boolean = false;

  tasksInPortfolio: Task[] = [];
  ngOnInit() {
    this.loading = true;
    this.project.getTasksIncludedInPortfolio().subscribe({
      next: (tasks) => {
        for (const taskId of tasks) {
          const task = this.project.tasks.find((t) => t.id === taskId);
          if (task) {
            this.tasksInPortfolio.push(task);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        this.alertService.error(`Failed to get tasks for portfolio: ${error}`, 6000);
      },
    });
  }
}
