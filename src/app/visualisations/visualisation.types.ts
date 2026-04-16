export interface ChartMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ChartAxisConfig {
  axisLabel?: string;
  tickFormat?: (d: number) => string;
  ticks?: number;
}

export interface ChartTooltipConfig {
  valueFormatter?: (d: number) => string;
  keyFormatter?: (d: string) => string;
  contentGenerator?: (data: InteractiveChartData) => string;
}

export interface InteractiveChartData {
  value: number;
  series: ChartSeriesPoint[];
}

export interface ChartSeriesPoint {
  key: string;
  value: number;
  color: string;
}

export interface ChartOptions {
  type: string;
  height?: number;
  margin?: ChartMargin;
  color?: string[] | ((d: unknown, i: number) => string);
  showLabels?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  transitionDuration?: number;
  duration?: number;
  useInteractiveGuideline?: boolean;
  interactiveLayer?: {
    tooltip?: ChartTooltipConfig;
  };
  tooltip?: ChartTooltipConfig;
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  x?: (d: unknown) => number | string;
  y?: (d: unknown) => number;
  xDomain?: [Date | number, Date | number];
  yDomain?: [number, number];
}

export interface ChartConfig {
  chart: ChartOptions;
  title?: Record<string, string>;
  subtitle?: Record<string, string>;
}

export interface ChartDataPoint {
  key?: string;
  y?: number;
  statusKey?: string;
  values?: number[][];
  color?: string;
  classed?: string;
}

export interface BurndownDataSeries {
  key: string;
  values: number[][];
  color?: string;
  classed?: string;
}

export interface PieChartDataPoint {
  key: string;
  y: number;
  statusKey: string;
}
