import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {GradeService} from '../services/grade.service';

@Component({
  selector: 'f-grade-icon',
  templateUrl: './grade-icon.component.html',
  styleUrls: ['./grade-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GradeIconComponent implements OnInit, OnChanges {
  @Input() grade?: number | string;
  @Input() unit?: Unit;
  @Input() colorful: boolean = false;

  gradeText: string = 'Grade';
  gradeLetter: string = 'G';

  constructor(private gradeService: GradeService) {}

  ngOnInit(): void {
    this.updateGrade();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grade'] || changes['unit']) {
      this.updateGrade();
    }
  }

  private updateGrade(): void {
    const grade: number =
      typeof this.grade === 'string'
        ? this.gradeService.stringToGrade(this.grade, this.unit)
        : this.grade;
    this.gradeText = this.gradeService.gradeLabel(grade, this.unit) || 'Grade';
    this.gradeLetter = this.gradeService.gradeAbbreviation(grade, this.unit) || 'G';
  }
}
