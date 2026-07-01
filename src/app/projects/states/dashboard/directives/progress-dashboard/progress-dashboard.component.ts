import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Project} from 'src/app/api/models/project';
import {GradeDefinition} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {UserService} from 'src/app/api/services/user.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {ProjectContentComponent} from '../../../content/project-content.component';

@Component({
  selector: 'f-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
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
    private dialog: MatDialog,
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

  public get targetGradeDefinitions(): GradeDefinition[] {
    return this.project.unit.gradeDefinitions.filter((definition) => definition.value >= 0);
  }

  public openContentForGrade(grade: GradeDefinition): void {
    this.dialog.open(ProjectContentComponent, {
      data: {
        contentRoute: `/grades/${grade.id}`,
        unit: this.project.unit,
      },
      height: '90vh',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'overflow-hidden',
      width: 'calc(100vw - 32px)',
    });
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
