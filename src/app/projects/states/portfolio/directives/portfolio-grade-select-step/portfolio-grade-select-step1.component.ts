import { Component, Input, OnInit, Inject } from '@angular/core';
import { gradeService, project } from 'src/app/ajs-upgraded-providers';

@Component({
    selector: 'portfolio-grade-select-step1',
    templateUrl: 'portfolio-grade-select-step1.component.html',
    styleUrls: ['portfolio-grade-select-step1.component.scss'],
})
export class PortfolioGradeSelectStep1 {
    @Input() agreedToAssessmentCriteria: boolean;
    @Input() project: any;
    @Input() advanceActiveTab: any;
    grades: any;

    constructor(@Inject(gradeService) private gradeService:any, @Inject(project) private projectFactory) { }

    ngOnInit() {
        this.grades = this.gradeService.grades;
    }

    chooseGrade (index) {
        this.projectFactory.update({ id: this.project.project_id, submitted_grade: index }, (project) => {
            this.project.submitted_grade = project.submitted_grade;
            this.project.burndown_chart_data = project.burndown_chart_data;
        })
    }
}