import {Component, Input, Inject, signal} from '@angular/core';
import {ElementRef, Injector, AfterViewInit} from '@angular/core';
import angular from 'angular';
import {Project} from 'src/app/api/models/project';
import {ProjectService} from 'src/app/api/services/project.service';
import {AlertService} from 'src/app/common/services/alert.service';
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
  @Input() project_data: Project;
  @Input() unit: any; //test

  private $scope: any;

  grades = this.gradeService.grades;
  gradeList = this.gradeService.gradeViewData;
  targetGrade = null;
  agreedToAssessmentCriteria: boolean = false;
  selectedSubmittedGrade: any = '';

  ngOnInit(): void {
    this.selectedSubmittedGrade = this.project.submittedGrade;
    this.gradeList = this.gradeService.gradeViewData.filter((g) => g.value !== -1);
    this.targetGrade = this.grades[this.project.targetGrade];
    console.log('TargetGrade:', this.targetGrade);
  }

  constructor(
    private gradeService: GradeService,
    private injector: Injector,
    private projectService: ProjectService,
    private alertService: AlertService,
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
