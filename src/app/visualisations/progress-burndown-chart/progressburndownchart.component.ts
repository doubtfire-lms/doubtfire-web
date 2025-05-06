import {Component, OnInit, Input, SimpleChanges, LOCALE_ID, ViewContainerRef} from '@angular/core';
import {Project, Unit} from 'src/app/api/models/doubtfire-model';
import {formatDate} from '@angular/common';
import {AppInjector} from 'src/app/app-injector';
import {ChartBaseComponent} from 'src/app/common/chart-base/chart-base-component/chart-base-component.component';

@Component({
  selector: 'f-progress-burndown-chart',
  templateUrl: './progressburndownchart.component.html',
  styleUrls: ['./progressburndownchart.component.scss'],
})
export class ProgressBurndownChartComponent extends ChartBaseComponent implements OnInit {
  @Input() project: Project;
  @Input() unit: Unit;
  @Input() grade: any;

  data: any[] = [];
  temp: any[] = [];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Time';
  yAxisLabel: string = 'Tasks Remaining';
  colorScheme = {domain: ['#AAAAAA', '#777777', '#0079d8', '#E01B5D', 'transparent']};
  yScaleMin: number = 0;
  yScaleMax: number = 100;

  private seriesVisibility: {[key: string]: boolean} = {};

  constructor(public viewContainerRef: ViewContainerRef) {
    super(viewContainerRef);
    this.data = [];
    this.temp = [];
  }

  ngOnInit(): void {
    this.project.refreshBurndownChartData();
    this.updateData();
    this.data.forEach((item) => {
      this.seriesVisibility[item.name] = true;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('grade' in changes && changes.grade.currentValue !== undefined) {
      this.project.refreshBurndownChartData();
      this.updateData();
    }
  }

  updateData(): void {
    const chartData = this.project?.burndownChartData;
    const locale: string = AppInjector.get(LOCALE_ID);
    const startDate: Date = this.project.unit.startDate;
    const endDate: Date = this.project.unit.endDate;

    if (!chartData) {
      this.data = [];
      return;
    }

    const formattedData = chartData.map((series) => ({
      name: series.key, // Use the "key" as the "name"
      series: series.values
        .filter((value) => value[0] >= startDate.getTime() && value[0] <= endDate.getTime()) // Filter values based on the date range
        .map((value) => {
          if (value[1] < 0) {
            value[1] = 0; // If the value is negative, set it to 0
          }
          value[1] = Math.round(value[1] * 100); // Round the value to 2 decimal places
          return {
            name: formatDate(new Date(value[0]), 'd MMM', locale), // Format the timestamp as a date
            value: value[1],
          };
        }),
    }));

    // Hack to get around yScaleMin and yScaleMax not working.
    const target = formattedData.find((series) => series.name === 'Target');
    if (target) {
      const start = target.series.find(
        (point) => point.name === formatDate(new Date(startDate), 'd MMM', locale),
      );
      const end = target.series.find(
        (point) => point.name === formatDate(new Date(endDate), 'd MMM', locale),
      );

      if (start) start.value = 100; // Update start
      if (end) end.value = 0; // Update end
    }

    this.temp = JSON.parse(JSON.stringify(formattedData));
    this.data = formattedData;
  }

  onSelect(event): void {
    if (this.isLegend(event)) {
      const tempData = JSON.parse(JSON.stringify(this.data));
      if (this.isDataShown(event)) {
        tempData.forEach((series) => {
          if (series.name === event) {
            series.series.forEach((point) => (point.value = 0));
          }
        });
      } else {
        const originalSeries = this.temp.find((series) => series.name === event);
        const seriesIndex = tempData.findIndex((series) => series.name === event);
        if (seriesIndex >= 0) {
          tempData[seriesIndex] = JSON.parse(JSON.stringify(originalSeries));
        }
      }
      this.data = tempData;
    }
  }

  isLegend(event: any): boolean {
    return typeof event === 'string';
  }

  isDataShown(name: string): boolean {
    const series = this.data.find((series) => series.name === name);
    return series && series.series.some((point) => point.value !== 0);
  }

  public formatPerc(input) {
    return `${input}%`;
  }
}
