import {Component, Input} from '@angular/core';
import {Injector} from '@angular/core';
import angular from 'angular';
import {ProjectService} from 'src/app/api/services/project.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'portfolio-grade-select-step',
  templateUrl: 'portfolio-grade-select-step.component.html',
  styleUrls: ['portfolio-grade-select-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PortfolioGradeSelectStepComponent {
  @Input() project: any;
  @Input() unit: any;
  private $scope: any;

  grades = this.gradeService.grades;
  gradeList = this.gradeService.gradeViewData;
  targetGrade?: number;
  agreedToAssessmentCriteria: boolean = false;
  selectedSubmittedGrade?: number;

  ngOnInit(): void {
    this.selectedSubmittedGrade = this.project.submittedGrade;
    this.gradeList = this.gradeService.gradeViewData.filter((g) => g.value !== -1);
    this.targetGrade = this.grades[this.project.targetGrade];
  }

  constructor(
    private gradeService: GradeService,
    private injector: Injector,
    private projectService: ProjectService,
  ) {
    this.$scope = this.injector.get('$scope');
  }

  updateSubmittedGrade(newGrade: any): void {
    const gradeValue = newGrade.value ?? newGrade['value'];
    this.selectedSubmittedGrade = gradeValue;
    this.project.submittedGrade = gradeValue;

    this.projectService.update(this.project).subscribe(
      (project) => {
        project.refreshBurndownChartData?.();
      },
      (error) => {
        console.error('Error updating target grade:', error);
      },
    );
  }

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
