import {MultiSeries} from '@glitchtip/ng-charts';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-stacked-area-status-chart',
  templateUrl: './stacked-area-status-chart.component.html',
  styleUrl: './stacked-area-status-chart.component.css',
  standalone: false,
})
export class StackedAreaStatusChartComponent {
  @Input() weeklyData: MultiSeries = [];
  @Input() colorScheme: any = {domain: ['']};

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Records';
}
