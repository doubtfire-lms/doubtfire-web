import { Component, Input, OnInit, Inject } from '@angular/core';
import { gradeService, project } from 'src/app/ajs-upgraded-providers';

@Component({
    selector: 'portfolio-grade-select-step',
    templateUrl: 'portfolio-grade-select-step.component.html',
    styleUrls: ['portfolio-grade-select-step.component.scss'],
})
export class PortfolioGradeSelectStepComponent {
    @Input() scope: any;

    constructor(@Inject(gradeService) private gradeService:any, @Inject(project) private projectFactory) { }

    ngOnInit() {
        this.scope.grades = this.gradeService.grades;
        this.scope.agreedToAssessmentCriteria = this.scope.projectHasLearningSummaryReport();
    }

    chooseGrade (index) {
        this.projectFactory.update({ id: this.scope.project.project_id, submitted_grade: index }, (project) => {
            this.scope.project.submitted_grade = project.submitted_grade;
            this.scope.project.burndown_chart_data = project.burndown_chart_data;
        })
    }
}