import {Component, Input} from '@angular/core';
import {MultiSeries} from '@glitchtip/ng-charts';
@Component({
  selector: 'f-completion-status-chart',
  templateUrl: './completion-status-chart.component.html',
  styleUrl: './completion-status-chart.component.css',
  standalone: false,
})
export class CompletionStatusChartComponent {
  @Input() weeklyData: MultiSeries = [];
  @Input() colorScheme: any = {domain: ['']};

  XAxisLabel: string = 'Week';
  YAxisLabel: string = 'Records';
}
