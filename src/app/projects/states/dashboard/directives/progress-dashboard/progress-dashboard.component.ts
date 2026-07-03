import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {MatOption} from '@angular/material/autocomplete';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {RouterLink} from '@angular/router';
import {Project} from 'src/app/api/models/project';
import {ProjectService} from 'src/app/api/services/project.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {ProgressBurndownChartComponent} from '../../../../../visualisations/progress-burndown-chart/progress-burndown-chart.component';
import {TaskVisualisationComponent} from '../../../../../visualisations/task-visualisation/task-visualisation.component';
import {TaskIlosCardComponent} from '../task-dashboard/directives/task-ilos-card/task-ilos-card.component';
import {EngagementPassportCardComponent} from './engagement-passport-card/engagement-passport-card.component';
import {TaskPlannerCardComponent} from './task-planner-card/task-planner-card.component';

@Component({
  selector: 'f-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TaskPlannerCardComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    RouterLink,
    TaskIlosCardComponent,
    EngagementPassportCardComponent,
    ProgressBurndownChartComponent,
    TaskVisualisationComponent,
  ],
})
export class ProgressDashboardComponent implements OnInit {
  @Input() project: Project;
  @Output() doUpdateTargetGrade: EventEmitter<void> = new EventEmitter();

  grades: {names: Record<number, string>; values: number[]} = {
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
    this.grades.values = this.gradeService.gradeValuesFor(this.project.unit);
    this.grades.names = Object.fromEntries(
      this.project.unit.gradeDefinitions.map((definition) => [definition.value, definition.label]),
    );
    this.updateTaskCompletionValues();
    this.project?.refreshBurndownChartData();
  }

  public get viewingOtherStudentProject(): boolean {
    const role = this.project?.unit?.myRole;
    const currentUser = this.userService.currentUser;

    return !!role && role !== 'Student' && this.project?.student?.id !== currentUser?.id;
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
