import {LegendPosition} from '@swimlane/ngx-charts';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Project} from 'src/app/api/models/project';

@Component({
  selector: 'f-project-progress-gauge',
  templateUrl: './project-progress-gauge.component.html',
  styleUrl: './project-progress-gauge.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectProgressGaugeComponent {
  @Input() project: Project;

  protected gaugeData = [
    {
      'name': 'Pass',
      'value': 100,
    },
    {
      'name': 'Credit',
      'value': 79,
    },
    {
      'name': 'Distinction',
      'value': 40,
    },
    {
      'name': 'HD',
      'value': 19,
    },
  ];

  smallView: [number, number] = [90, 90];
  view: [number, number] = [500, 500];
  legend: boolean = true;
  legendPosition: LegendPosition = LegendPosition.Below;
  rightLegendPosition: LegendPosition = LegendPosition.Right;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };
}
