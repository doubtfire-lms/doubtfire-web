mod = angular.module('doubtfire.visualisations', [
  require('./summary-task-status-scatter')
  require('./progress-burndown-chart')
  require('./alignment-bar-chart')
  require('./alignment-bullet-chart')
  require('./student-task-status-pie-chart')
  require('./task-status-pie-chart')
  require('./target-grade-pie-chart')
  require('./task-completion-box-plot')
  require('./achievement-box-plot')
  require('./achievement-custom-bar-chart')
])

.factory('Visualisation', ($interval, analyticsService) ->
  Visualisation = (type, visualisationName, opts, conf, titleOpts, subtitleOpts) ->
    DEFAULT_OPTS =
      objectequality: yes
      interactive: yes
      # tooltips: yes
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

    DEFAULT_CONF = {
      visible: true, # default: true
      extended: false, # default: false
      disabled: false, # default: false
      autorefresh: true, # default: true
      refreshDataOnly: true, # default: true
      deepWatchOptions: true, # default: true
      deepWatchData: false, # default: false
      deepWatchConfig: true, # default: true
      debounce: 10 # default: 10
    }

    dirtyOpts = angular.extend {}, DEFAULT_OPTS, opts
    dirtyOpts.type = type

    dirtyConf = angular.extend {}, DEFAULT_CONF, conf

    # Google tracking
    analyticsService.event 'Visualisations', 'Created Visualisation', visualisationName

    [ { chart: dirtyOpts, title: titleOpts, subtitle: subtitleOpts },  dirtyConf ]


  Visualisation.refreshAll = ->
    $interval (() -> window.dispatchEvent(new Event('resize'))), 50, 1

  Visualisation
)

module.exports = mod.name
