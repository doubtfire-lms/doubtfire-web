angular.module('doubtfire.visualisations.task-completion-box-plot', [])
.directive 'taskCompletionBoxPlot', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    median: '='
    lower: '='
    upper: '='
    min: '='
    max: '='
    range: '='
  controller: ($scope, $timeout, gradeService, projectService, Visualisation) ->
    $scope.data = [
      {
        label: "Unit"
        values: {
          Q1: $scope.lower
          Q2: $scope.median
          Q3: $scope.upper
          whisker_low: $scope.min
          whisker_high: $scope.max
        }
      }
    ]

    [$scope.options, $scope.config] = Visualisation 'boxPlotChart', {
      colors: ['darkblue']
      x: (d) -> d.label
      margin:
        top: 20
        right: 10
        bottom: 60
        left: 80
      yAxis:
        axisLabel: "Number of tasks completed"
      maxBoxWidth: 75
      yDomain: [0, Math.ceil($scope.range/2) * 2] #round to nearest 2
    }, {}
