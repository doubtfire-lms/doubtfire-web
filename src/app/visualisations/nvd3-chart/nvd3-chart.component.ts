import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {ChartConfig, ChartDataPoint, ChartOptions} from '../visualisation.types';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const nv: Record<string, any>;
declare const d3: Record<string, any>;

interface NvChart {
  [key: string]: ((...args: unknown[]) => unknown) | NvChart;
  update: () => void;
}

@Component({
  selector: 'f-nvd3-chart',
  template: '<div #chartContainer></div>',
  styles: [':host { display: block; }'],
})
export class Nvd3ChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() options: ChartConfig;
  @Input() data: ChartDataPoint[];

  @ViewChild('chartContainer', {static: true}) chartContainer: ElementRef;

  private chart: NvChart;
  private svg: {
    datum: (data: ChartDataPoint[]) => {
      call: (chart: NvChart) => void;
      transition: () => {duration: (ms: number) => {call: (chart: NvChart) => void}};
    };
    remove: () => void;
  };

  ngOnInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes.data || changes.options)) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
  }

  refresh(): void {
    this.updateChart();
  }

  update(): void {
    this.updateChart();
  }

  private buildChart(): void {
    if (!this.options?.chart) return;

    const chartOpts = this.options.chart;
    const chartType = chartOpts.type;

    if (!nv.models[chartType]) return;

    nv.addGraph(() => {
      this.chart = nv.models[chartType]() as NvChart;
      this.configureChart(this.chart, chartOpts);

      this.svg = d3
        .select(this.chartContainer.nativeElement)
        .append('svg')
        .style('height', (chartOpts.height || 400) + 'px')
        .style('width', '100%');

      this.svg.datum(this.data || []).call(this.chart);

      nv.utils.windowResize(this.chart.update);

      return this.chart;
    });
  }

  private configureChart(chart: NvChart, opts: ChartOptions): void {
    const set = (prop: string, value: unknown) => {
      if (value !== undefined && typeof chart[prop] === 'function') {
        (chart[prop] as (...args: unknown[]) => void)(value);
      }
    };

    set('x', opts.x);
    set('y', opts.y);
    set('color', opts.color);
    set('showLabels', opts.showLabels);
    set('showLegend', opts.showLegend);
    set('showValues', opts.showValues);
    set('height', opts.height);
    set('margin', opts.margin);
    set('yDomain', opts.yDomain);
    set('xDomain', opts.xDomain);
    set('useInteractiveGuideline', opts.useInteractiveGuideline);
    set('duration', opts.duration);
    set('transitionDuration', opts.transitionDuration);

    if (opts.interactiveLayer?.tooltip?.contentGenerator && chart.interactiveLayer) {
      const layer = chart.interactiveLayer as NvChart;
      const tooltip = layer.tooltip as NvChart;
      (tooltip.contentGenerator as (...args: unknown[]) => void)(
        opts.interactiveLayer.tooltip.contentGenerator,
      );
    }
    if (opts.tooltip && chart.tooltip) {
      const tooltip = chart.tooltip as NvChart;
      if (opts.tooltip.valueFormatter)
        (tooltip.valueFormatter as (...args: unknown[]) => void)(opts.tooltip.valueFormatter);
      if (opts.tooltip.keyFormatter)
        (tooltip.keyFormatter as (...args: unknown[]) => void)(opts.tooltip.keyFormatter);
    }

    if (opts.xAxis && chart.xAxis) {
      const xAxis = chart.xAxis as NvChart;
      if (opts.xAxis.axisLabel)
        (xAxis.axisLabel as (...args: unknown[]) => void)(opts.xAxis.axisLabel);
      if (opts.xAxis.tickFormat)
        (xAxis.tickFormat as (...args: unknown[]) => void)(opts.xAxis.tickFormat);
      if (opts.xAxis.ticks) (xAxis.ticks as (...args: unknown[]) => void)(opts.xAxis.ticks);
    }
    if (opts.yAxis && chart.yAxis) {
      const yAxis = chart.yAxis as NvChart;
      if (opts.yAxis.axisLabel)
        (yAxis.axisLabel as (...args: unknown[]) => void)(opts.yAxis.axisLabel);
      if (opts.yAxis.tickFormat)
        (yAxis.tickFormat as (...args: unknown[]) => void)(opts.yAxis.tickFormat);
    }
  }

  private updateChart(): void {
    if (!this.chart || !this.svg) return;
    this.svg
      .datum(this.data || [])
      .transition()
      .duration(350)
      .call(this.chart);
  }
}
