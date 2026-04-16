import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {VisualisationService} from '../visualisation.service';
import {Nvd3ChartComponent} from '../nvd3-chart/nvd3-chart.component';
import {BurndownDataSeries, ChartConfig, ChartSeriesPoint} from '../visualisation.types';
import {Subscription, interval} from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const d3: Record<string, any>;

@Component({
  selector: 'f-progress-burndown-chart',
  template: '<f-nvd3-chart #chart [options]="options" [data]="data"></f-nvd3-chart>',
  styleUrls: ['./progress-burndown-chart.component.scss'],
})
export class ProgressBurndownChartComponent implements OnInit, OnDestroy {
  @Input() project: Project;
  @Input() unit: Unit;

  @ViewChild('chart') chartComponent: Nvd3ChartComponent;

  options: ChartConfig;
  data: BurndownDataSeries[] = [];
  private pollSub: Subscription;

  constructor(private visualisationService: VisualisationService) {}

  ngOnInit(): void {
    if (!this.project?.unit || !this.unit) return;
    this.buildOptions();
    this.project.refreshBurndownChartData();
    this.pollSub = interval(500).subscribe(() => this.checkData());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // Polls until burndownChartData is populated (loaded async), then renders once and stops polling
  private checkData(): void {
    const chartData = this.project.burndownChartData;
    if (!chartData) return;

    // Add a vertical dashed line at the current date (two points at y=0 and y=1)
    const now = +new Date().getTime();
    const timeSeries: BurndownDataSeries = {
      key: 'NOW',
      values: [
        [now, 0],
        [now, 1],
      ],
      color: '#CACACA',
      classed: 'dashed',
    };

    if (!chartData.find((d) => d.key === 'NOW')) {
      chartData.push(timeSeries);
    }

    this.data = [...chartData];
    this.pollSub?.unsubscribe();

    setTimeout(() => this.chartComponent?.refresh(), 100);
  }

  private buildOptions(): void {
    const xAxisTickFormat = (d: number) => d3.time.format('%b %d')(new Date(d)); // e.g. "Apr 16"
    const yAxisTickFormat = (d: number) => d3.format(',%')(d); // e.g. "50%"

    const colorFunction = (_d: unknown, i: number) => {
      if (i === 0) return '#AAAAAA';
      if (i === 1) return '#777777';
      if (i === 2) return '#0079d8';
      return '#E01B5D';
    };

    const xDomain: [Date, Date] = [this.unit.startDate, this.unit.endDate];

    this.options = this.visualisationService.createOptions('lineChart', {
      useInteractiveGuideline: true,
      interactiveLayer: {
        tooltip: {
          contentGenerator: (data: {value: number; series: ChartSeriesPoint[]}) => {
            const date = d3.time.format('%b %d')(new Date(data.value));
            const series = data.series;
            let html = `<table class='col-sm-6'><thead><tr><td colspan='3'><strong class='x-value'>${date}</strong></td></tr></thead><tbody>`;
            html += series
              .filter((d) => d.key !== 'NOW')
              .map(
                (d) =>
                  `<tr><td class='legend-color-guide'><div style='background-color: ${d.color};'></div></td><td class='key'>${d.key}</td><td class='value'>${d3.format(',%')(d.value)}</td></tr>`,
              )
              .join('');
            html += '</tbody></table>';
            return html;
          },
        },
      },
      height: 440,
      margin: {left: 75, right: 50},
      xAxis: {
        axisLabel: 'Time',
        tickFormat: xAxisTickFormat,
        ticks: 8,
      },
      yAxis: {
        axisLabel: 'Tasks Remaining',
        tickFormat: yAxisTickFormat,
      },
      color: colorFunction,
      x: (d: number[]) => (d ? d[0] : undefined),
      y: (d: number[]) => (d && d[1] < 0.0 ? 0 : d?.[1]),
      yDomain: [0, 1],
      xDomain,
    });
  }
}
