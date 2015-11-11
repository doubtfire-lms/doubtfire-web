angular.module('doubtfire.visualisations', [
  'doubtfire.visualisations.summary-task-status-scatter'
  'doubtfire.visualisations.progress-burndown-chart'
])

.constant('Visualisation', (type, opts) ->
  DEFAULTS =
    objectequality: yes
    interactive: yes
    tooltips: yes
    showValues: yes
    showXAxis: yes
    showYAxis: yes
    showLegend: yes
    transitionDuration: 500
    duration: 500
    height: 600
    color: [
      "#1f77b4"
      "#ff7f0e"
      "#2ca02c"
      "#d62728"
      "#9467bd"
      "#8c564b"
      "#e377c2"
      "#7f7f7f"
      "#bcbd22"
      "#17becf"
    ]
  dirtyOpts = angular.copy opts
  dirtyOpts.type = type
  dirtyOpts = angular.extend dirtyOpts, DEFAULTS
  # Need to override angular extend's defaults if present in opts
  dirtyOpts[key] = value for key, value of opts
  { chart: dirtyOpts }
)