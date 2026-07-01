import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {Subscription, interval} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {Task} from 'src/app/api/models/task';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-portfolio-included-tasks',
  templateUrl: 'portfolio-included-tasks.component.html',
  styleUrls: ['portfolio-included-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfolioIncludedTasksComponent implements OnInit, OnDestroy {
  @Input() project: Project;
  @Output() canCreatePortfolioChange: EventEmitter<boolean> = new EventEmitter();

  constructor(private alertService: AlertService) {}

  loadingIncludedTasks: boolean = false;
  loadingProcessingTasks: boolean = false;
  hasTasksStillProcessing: boolean = false;

  tasksInPortfolio: Task[] = [];
  tasksStillProcessing: Task[] = [];

  private processingTasksPoll?: Subscription;

  ngOnInit() {
    this.getTasksIncludedInPortfolio();
    this.getProcessingTasks();
  }

  ngOnDestroy(): void {
    this.processingTasksPoll?.unsubscribe();
  }

  public getTasksIncludedInPortfolio() {
    this.loadingIncludedTasks = true;
    this.canCreatePortfolioChange.emit(false);
    this.project.getTasksIncludedInPortfolio().subscribe({
      next: (tasks) => {
        this.tasksInPortfolio = this.getProjectTasks(tasks);

        this.loadingIncludedTasks = false;
        this.updateCanCreatePortfolio();
      },
      error: (error) => {
        this.alertService.error(`Failed to get tasks for portfolio: ${error}`, 6000);
      },
    });
  }

  public getProcessingTasks(refreshIncludedTasksOnCountChange: boolean = false) {
    this.loadingProcessingTasks = true;
    this.canCreatePortfolioChange.emit(false);
    this.project.getTasksStillProcessing().subscribe({
      next: (tasks) => {
        const processingTaskCountChanged = tasks.length !== this.tasksStillProcessing.length;

        this.hasTasksStillProcessing = tasks.length > 0;
        this.tasksStillProcessing = this.getProjectTasks(tasks);

        if (refreshIncludedTasksOnCountChange && processingTaskCountChanged) {
          this.getTasksIncludedInPortfolio();
        }

        this.updateProcessingTasksPoll();
        this.loadingProcessingTasks = false;
        this.updateCanCreatePortfolio();
      },
      error: (error) => {
        this.alertService.error(`Failed to get tasks for portfolio: ${error}`, 6000);
      },
    });
  }

  private getProjectTasks(taskIds: number[]): Task[] {
    return taskIds
      .map((taskId) => this.project.tasks.find((task) => task.id === taskId))
      .filter((task): task is Task => task !== undefined);
  }

  private updateProcessingTasksPoll(): void {
    if (this.hasTasksStillProcessing && !this.processingTasksPoll) {
      this.processingTasksPoll = interval(30_000).subscribe(() => {
        this.getProcessingTasks(true);
      });
      return;
    }

    if (!this.hasTasksStillProcessing) {
      this.processingTasksPoll?.unsubscribe();
      this.processingTasksPoll = undefined;
    }
  }

  private updateCanCreatePortfolio(): void {
    this.canCreatePortfolioChange.emit(
      !this.loadingIncludedTasks && !this.loadingProcessingTasks && !this.hasTasksStillProcessing,
    );
  }
}
