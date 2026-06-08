import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {TaskService} from 'src/app/api/services/task.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-portfolios-project-progress',
  templateUrl: './portfolios-project-progress.component.html',
  styleUrl: './portfolios-project-progress.component.scss',
  standalone: false,
})
export class PortfoliosProjectProgressComponent {
  @Input() project: Project;
  @Input() unit: Unit;

  public taskStats: {numberOfTasksCompleted: number; numberOfTasksRemaining: number} = {
    numberOfTasksCompleted: 0,
    numberOfTasksRemaining: 0,
  };

  constructor(
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
    private taskService: TaskService,
  ) {}

  public get gradeValues() {
    return this.gradeService.gradeValues;
  }
  public get grades() {
    return this.gradeService.grades;
  }

  public gradeWord(grade) {
    return this.gradeService.grades[grade];
  }

  updateTaskCompletionStats() {
    this.taskStats.numberOfTasksCompleted = this.project.tasksByStatus(
      this.taskService.completeStatus,
    ).length;
    this.taskStats.numberOfTasksRemaining =
      this.project.activeTasks().length - this.taskStats.numberOfTasksCompleted;
  }

  updateSubmittedGrade(newGrade: number): void {
    const previousSubmittedGrade = this.project.submittedGrade;
    this.project.submittedGrade = newGrade;

    this.projectService.update(this.project).subscribe({
      next: (project) => {
        project.refreshBurndownChartData?.();
        this.alertService.success(`Updated project's submitted grade`);
        this.updateTaskCompletionStats();
      },
      error: (error) => {
        this.project.submittedGrade = previousSubmittedGrade;
        this.alertService.error(`Failed to update submitted grade: ${error}`);
      },
    });
  }

  updatedTargetGrade(newGrade: number): void {
    const previousTargetGrade = this.project.targetGrade;
    this.project.targetGrade = newGrade;

    this.projectService.update(this.project).subscribe({
      next: (project) => {
        project.refreshBurndownChartData?.();
        this.alertService.success(`Updated project's target grade`);
        this.updateTaskCompletionStats();
      },
      error: (error) => {
        this.project.targetGrade = previousTargetGrade;
        this.alertService.error(`Failed to update target grade: ${error}`);
      },
    });
  }
}
