import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {ProjectService} from 'src/app/api/services/project.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {GradeIconComponent} from '../../../../../common/grade-icon/grade-icon.component';

@Component({
  selector: 'f-portfolio-grade-select-step',
  templateUrl: 'portfolio-grade-select-step.component.html',
  styleUrls: ['portfolio-grade-select-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatIcon,
    MatCardActions,
    MatCheckbox,
    FormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    GradeIconComponent,
    MatButton,
  ],
})
export class PortfolioGradeSelectStepComponent {
  @Input() project: Project;
  @Input() unit: Unit;
  @Input() onAdvanceActiveTab?: (index: 1 | -1) => void;

  public agreedToAssessmentCriteria: boolean = false;

  constructor(
    private gradeService: GradeService,
    private projectService: ProjectService,
    private alertService: AlertService,
  ) {}

  public get gradeValues() {
    return this.gradeService.gradeValuesFor(this.unit);
  }

  public get targetGrade(): string {
    return this.gradeService.grades[this.project.submittedGrade] ?? 'selected grade';
  }

  updateSubmittedGrade(newGrade: number): void {
    const previousSubmittedGrade = this.project.submittedGrade;
    this.project.submittedGrade = newGrade;

    this.projectService.update(this.project).subscribe(
      (project) => {
        project.refreshBurndownChartData?.();
      },
      (error) => {
        this.project.submittedGrade = previousSubmittedGrade;
        console.error('Error updating target grade:', error);
        this.alertService.error(`Could not update grade: ${error}`, 6000);
      },
    );
  }

  private navigate(index: 1 | -1): void {
    if (this.onAdvanceActiveTab) {
      this.onAdvanceActiveTab(index);
      return;
    }
  }

  goToNextStep(): void {
    this.navigate(1);
  }

  goToPreviousStep(): void {
    this.navigate(-1);
  }
}
