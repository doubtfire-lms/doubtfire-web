import {Injectable} from '@angular/core';
import {ChartConfig, ChartOptions} from './visualisation.types';

@Injectable({
  providedIn: 'root',
})
export class VisualisationService {
  private static readonly DEFAULT_OPTS: Partial<ChartOptions> = {
    showValues: true,
    showXAxis: true,
    showYAxis: true,
    showLegend: true,
    transitionDuration: 500,
    duration: 500,
    height: 600,
    color: [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
    ],
  };

  createOptions(
    type: string,
    opts: Partial<ChartOptions> = {},
    titleOpts?: Record<string, string>,
    subtitleOpts?: Record<string, string>,
  ): ChartConfig {
    const chartOpts: ChartOptions = {...VisualisationService.DEFAULT_OPTS, ...opts, type};
    return {chart: chartOpts, title: titleOpts, subtitle: subtitleOpts};
  }

  refreshAll(): void {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }
}
