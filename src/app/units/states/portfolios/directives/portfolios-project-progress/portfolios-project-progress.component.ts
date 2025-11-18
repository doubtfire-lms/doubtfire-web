import {Component, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-portfolios-project-progress',
  templateUrl: './portfolios-project-progress.component.html',
  styleUrl: './portfolios-project-progress.component.scss',
})
export class PortfoliosProjectProgressComponent {
  @Input() project: Project;
  @Input() unit: Unit;

  constructor(
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
  ) {}

  public get grades() {
    return this.gradeService.gradeValues;
  }

  public gradeWord(grade) {
    return this.gradeService.grades[grade];
  }

  updateSubmittedGrade(newGrade: number): void {
    const previousSubmittedGrade = this.project.submittedGrade;
    this.project.submittedGrade = newGrade;

    this.projectService.update(this.project).subscribe({
      next: (project) => {
        project.refreshBurndownChartData?.();
        this.alertService.success(`Updated project's submitted grade`);
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
      },
      error: (error) => {
        this.project.targetGrade = previousTargetGrade;
        this.alertService.error(`Failed to update target grade: ${error}`);
      },
    });
  }
}
