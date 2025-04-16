import {Component, Input, Output, EventEmitter, OnInit, Inject} from '@angular/core';
import {GradeService} from 'src/app/common/services/grade.service';
import {analyticsService} from 'src/app/ajs-upgraded-providers';
import {AlertService} from 'src/app/common/services/alert.service';
import {ProjectService} from 'src/app/api/services/project.service';
import {Project} from 'src/app/api/models/project';

@Component({
  selector: 'f-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss'],
})
export class ProgressDashboardComponent implements OnInit {
  @Input() project: Project;
  @Output() doUpdateTargetGrade = new EventEmitter<void>();

  tutor: boolean;
  grades = {
    names: this.gradeService.grades,
    values: this.gradeService.gradeValues,
  };
  numberOfTasks = {
    completed: 0,
    remaining: 0,
  };

  constructor(
    private gradeService: GradeService,
    private projectService: ProjectService,
    @Inject(analyticsService) private AnalyticsService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.updateTaskCompletionValues();
    this.tutor = this.project.myRole === 'Tutor' ? true : false;
  }

  updateTargetGrade(newGrade: number): void {
    this.project.targetGrade = newGrade;
    this.projectService.update(this.project).subscribe(
      (project) => {
        project.refreshBurndownChartData();
        this.updateTaskCompletionValues();
        this.doUpdateTargetGrade.emit();
        this.AnalyticsService.event(
          'Student Project View - Progress Dashboard',
          'Grade Changed',
          this.grades.names[newGrade],
        );
        this.alertService.success('Updated target grade successfully', 2000);
      },
      (error) => {
        console.error('Error updating target grade:', error);
        this.alertService.error('Failed to update target grade', 4000);
      },
    );
  }

  private updateTaskCompletionValues(): void {
    const completedTasks = this.project.numberTasks('complete');
    this.numberOfTasks = {
      completed: completedTasks,
      remaining: this.project.activeTasks().length - completedTasks,
    };
  }
}
