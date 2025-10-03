import {Component, Injector, Input} from '@angular/core';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {ProjectService} from 'src/app/api/services/project.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-portfolio-grade-select-step',
  templateUrl: 'portfolio-grade-select-step.component.html',
  styleUrls: ['portfolio-grade-select-step.component.scss'],
})
export class PortfolioGradeSelectStepComponent {
  @Input() project: Project;
  @Input() unit: Unit;

  public agreedToAssessmentCriteria: boolean = false;

  constructor(
    private gradeService: GradeService,
    private injector: Injector,
    private projectService: ProjectService,
  ) {
    this.$scope = this.injector.get('$scope');
  }

  public get gradeValues() {
    return this.gradeService.gradeValues;
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
      },
    );
  }

  // TODO: remove this once parent component has been migrated
  private $scope: any;
  goToNextStep(): void {
    if (typeof this.$scope?.advanceActiveTab === 'function') {
      this.$scope.advanceActiveTab(1);
    }
  }

  goToPreviousStep(): void {
    if (typeof this.$scope?.advanceActiveTab === 'function') {
      this.$scope.advanceActiveTab(-1);
    }
  }
}
