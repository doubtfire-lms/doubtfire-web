import {Inject, Injectable} from '@angular/core';
import {interval} from 'rxjs';
import {take} from 'rxjs/operators';
import {analyticsService} from '../ajs-upgraded-providers';

type VisualisationOptions = Record<string, unknown>;
type VisualisationConfig = Record<string, unknown>;
type VisualisationTitle = Record<string, unknown> | undefined;
type VisualisationSubtitle = Record<string, unknown> | undefined;

export type VisualisationResult = [
  {
    chart: VisualisationOptions;
    title: VisualisationTitle;
    subtitle: VisualisationSubtitle;
  },
  VisualisationConfig,
];

@Injectable({
  providedIn: 'root',
})
export class VisualisationService {
  constructor(@Inject(analyticsService) private analytics: {event: (...args: unknown[]) => void}) {}

  create(
    type: string,
    visualisationName: string,
    opts?: VisualisationOptions,
    conf?: VisualisationConfig,
    titleOpts?: VisualisationTitle,
    subtitleOpts?: VisualisationSubtitle,
  ): VisualisationResult {
    const defaultOpts: VisualisationOptions = {
      objectequality: true,
      interactive: true,
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

    const defaultConfig: VisualisationConfig = {
      visible: true,
      extended: false,
      disabled: false,
      autorefresh: true,
      refreshDataOnly: true,
      deepWatchOptions: true,
      deepWatchData: false,
      deepWatchConfig: true,
      debounce: 10,
    };

    const dirtyOpts: VisualisationOptions = {
      ...defaultOpts,
      ...(opts ?? {}),
      type,
    };

    const dirtyConf: VisualisationConfig = {
      ...defaultConfig,
      ...(conf ?? {}),
    };

    this.analytics.event('Visualisations', 'Created Visualisation', visualisationName);

    return [
      {
        chart: dirtyOpts,
        title: titleOpts,
        subtitle: subtitleOpts,
      },
      dirtyConf,
    ];
  }

  refreshAll(): void {
    interval(50).pipe(take(1)).subscribe(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }
}
