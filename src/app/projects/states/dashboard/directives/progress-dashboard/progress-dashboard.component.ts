import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {ProjectService} from 'src/app/api/services/project.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss'],
  standalone: false,
})
export class ProgressDashboardComponent implements OnInit {
  @Input() project: Project;
  @Output() doUpdateTargetGrade: EventEmitter<void> = new EventEmitter();

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
    private alertService: AlertService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.updateTaskCompletionValues();
    this.project?.refreshBurndownChartData();
  }

  public get viewingOtherStudentProject(): boolean {
    const role = this.project?.unit?.myRole;
    const currentUser = this.userService.currentUser;

    return (
      !!role &&
      role !== 'Student' &&
      this.project?.student?.id !== currentUser?.id
    );
  }

  updateTargetGrade(newGrade: number): void {
    this.project.targetGrade = newGrade;
    this.projectService.update(this.project).subscribe(
      (project) => {
        project.refreshBurndownChartData();
        this.updateTaskCompletionValues();
        this.doUpdateTargetGrade.emit();
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
