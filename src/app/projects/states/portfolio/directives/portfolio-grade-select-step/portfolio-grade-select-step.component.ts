import {Component, Injector, Input, OnInit} from '@angular/core';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {ProjectService} from 'src/app/api/services/project.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-portfolio-grade-select-step',
  templateUrl: 'portfolio-grade-select-step.component.html',
  styleUrls: ['portfolio-grade-select-step.component.scss'],
})
export class PortfolioGradeSelectStepComponent implements OnInit {
  @Input() project: Project;
  @Input() unit: Unit;

  gradeList = this.gradeService.gradeViewData;
  agreedToAssessmentCriteria: boolean = false;

  ngOnInit(): void {
    this.gradeList = this.gradeService.gradeViewData.filter((g) => g.value !== -1);
  }

  constructor(
    private gradeService: GradeService,
    private injector: Injector,
    private projectService: ProjectService,
  ) {
    this.$scope = this.injector.get('$scope');
  }

  updateSubmittedGrade(newGrade: {value: number; viewValue: string}): void {
    const previousSubmittedGrade = this.project.submittedGrade;
    this.project.submittedGrade = newGrade.value;

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
