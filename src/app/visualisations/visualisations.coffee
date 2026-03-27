angular.module('doubtfire.visualisations', [
  'doubtfire.visualisations.summary-task-status-scatter'
  'doubtfire.visualisations.progress-burndown-chart'
  'doubtfire.visualisations.alignment-bar-chart'
  'doubtfire.visualisations.alignment-bullet-chart'
  'doubtfire.visualisations.student-task-status-pie-chart'
  'doubtfire.visualisations.task-status-pie-chart'
  'doubtfire.visualisations.target-grade-pie-chart'
  'doubtfire.visualisations.task-completion-box-plot'
  'doubtfire.visualisations.achievement-box-plot'
  'doubtfire.visualisations.achievement-custom-bar-chart'
])

.factory('Visualisation', (VisualisationServiceAngular) ->
  Visualisation = (type, visualisationName, opts, conf, titleOpts, subtitleOpts) ->
    VisualisationServiceAngular.create(
      type,
      visualisationName,
      opts,
      conf,
      titleOpts,
      subtitleOpts
    )

  Visualisation.refreshAll = ->
    VisualisationServiceAngular.refreshAll()

  Visualisation
)
