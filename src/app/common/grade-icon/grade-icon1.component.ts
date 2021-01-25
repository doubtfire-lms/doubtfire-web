import { Component, Input, OnInit, Inject } from '@angular/core';
import { gradeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'grade-icon1',
  templateUrl: 'grade-icon1.component.html',
  styleUrls: ['grade-icon1.component.scss'],
}) 
export class GradeIcon1Component implements OnInit {
  @Input() grade: any;
  @Input() colorful: boolean;
  gradeText: string;
  gradeLetter: string;

  constructor(@Inject(gradeService) private gradeService:any) { }

  ngOnInit() {
    this.grade = this.gradeService.grades.indexOf(this.grade);
    this.gradeText = this.gradeService.grades[this.grade] || "Grade";
    this.gradeLetter = this.gradeService.gradeAcronyms[this.gradeText] || "G";
  }
}