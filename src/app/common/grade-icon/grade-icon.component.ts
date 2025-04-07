import { Component, OnInit, Input } from '@angular/core';
import { GradeService } from '../services/grade.service';

@Component({
  selector: 'grade-icon',
  templateUrl: 'grade-icon.component.html',
  styleUrls: ['grade-icon.component.scss'],
})
export class GradeIconComponent implements OnInit {
  @Input() grade: string | number = 'F';
  @Input() index: number;

  gradeText: string;
  gradeLetter: string;

  constructor(private gradeService: GradeService) {}

  ngOnInit(): void {
    if (this.index == undefined) {
      this.index = this.gradeService.gradeNumbers[this.grade] || this.grade;
    }
    this.gradeText = this.gradeService.grades[this.index];
    this.gradeLetter = this.gradeService.gradeAcronyms[this.gradeText];
  }
}
