import { Component, OnInit, Input, Inject } from '@angular/core';
import { gradeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'grade-icon',
  templateUrl: 'grade-icon.component.html',
  styleUrls: ['grade-icon.component.scss'],
})
export class GradeIconComponent implements OnInit {
  @Input() grade: string = 'F';
  @Input() index: number;

  gradeText: string;
  gradeLetter: string;

  constructor(@Inject(gradeService) private GradeService: any) {}

  ngOnInit(): void {
    if (this.index == undefined) {
      this.index = this.GradeService.grades.indexOf(this.grade);
    }
    this.gradeText = this.GradeService.grades[this.index];
    this.gradeLetter = this.GradeService.gradeAcronyms[this.gradeText];
  }
}
