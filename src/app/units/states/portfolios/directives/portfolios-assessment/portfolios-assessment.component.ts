import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-portfolios-assessment',
  templateUrl: './portfolios-assessment.component.html',
  styleUrl: './portfolios-assessment.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PortfoliosAssessmentComponent {
  @Input() project: Project;
  @Input() unit: Unit;

  public gradeResults = [
    {
      name: 'Fail',
      scores: [0, 10, 20, 30, 40, 44],
    },
    {
      name: 'Pass',
      scores: [50, 53, 55, 57],
    },
    {
      name: 'Credit',
      scores: [60, 63, 65, 67],
    },
    {
      name: 'Distinction',
      scores: [70, 73, 75, 77],
    },
    {
      name: 'High Distinction',
      scores: [80, 83, 85, 87],
    },
    {
      name: 'High Distinction',
      scores: [90, 93, 95, 97, 100],
    },
  ];

  public maxScoresPerRow = Math.max(...this.gradeResults.map((g) => g.scores.length));
}
