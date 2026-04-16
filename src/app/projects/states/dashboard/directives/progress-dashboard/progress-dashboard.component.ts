import {Component, Inject, Input, OnChanges} from '@angular/core';
import {Project, ProjectService} from 'src/app/api/models/doubtfire-model';
import {GradeService} from 'src/app/common/services/grade.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {UIRouterGlobals} from '@uirouter/angular';
import {analyticsService} from 'src/app/ajs-upgraded-providers';

interface AnalyticsService {
  event(category: string, eventName: string, label?: string, value?: number): void;
}

@Component({
  selector: 'f-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss'],
})
export class ProgressDashboardComponent implements OnChanges {
  @Input() project: Project;
  @Input() onUpdateTargetGrade: () => void;

  tutor: boolean;
  numberOfTasks = {completed: 0, remaining: 0};
  grades: {names: Record<string, string>; values: number[]};

  constructor(
    private projectService: ProjectService,
    private gradeService: GradeService,
    private alertService: AlertService,
    private uiRouterGlobals: UIRouterGlobals,
    @Inject(analyticsService) private analytics: AnalyticsService,
  ) {
    this.grades = {
      names: gradeService.grades,
      values: gradeService.gradeValues,
    };
    this.tutor = this.uiRouterGlobals.params?.tutor;
  }

  ngOnChanges(): void {
    this.updateTaskCompletionValues();
  }

  updateTargetGrade(newGrade: number): void {
    this.project.targetGrade = newGrade;
    this.projectService.update(this.project).subscribe({
      next: (project) => {
        project.refreshBurndownChartData();
        this.updateTaskCompletionValues();
        this.onUpdateTargetGrade?.();
        this.analytics.event(
          'Student Project View - Progress Dashboard',
          'Grade Changed',
          this.grades.names[newGrade],
        );
        this.alertService.success('Updated target grade successfully', 2000);
      },
      error: () => {
        this.alertService.error('Failed to update target grade', 4000);
      },
    });
  }

  private updateTaskCompletionValues(): void {
    if (!this.project || typeof this.project.numberTasks !== 'function') return;
    const completed = this.project.numberTasks('complete');
    this.numberOfTasks = {
      completed,
      remaining: this.project.activeTasks().length - completed,
    };
  }
}
